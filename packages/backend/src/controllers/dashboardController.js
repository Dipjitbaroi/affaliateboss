// Dashboard Controller
// Contains business logic for dashboard-related operations

import { getDatabase } from '../../lib/prisma.js';

export class DashboardController {
    // Get dashboard statistics and overview
    static async getDashboardStats(req, res) {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            const db = getDatabase();

            // Get user stats
            const user = await db.user.findUnique({
                where: { id: userId },
                select: {
                    totalEarnings: true,
                    totalClicks: true,
                    totalConversions: true,
                    conversionRate: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                });
            }

            // Get pending and approved commissions
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const commissionStats = await db.commission.groupBy({
                by: ['status'],
                where: {
                    userId: userId,
                    saleDate: {
                        gte: thirtyDaysAgo
                    }
                },
                _sum: {
                    commissionAmount: true
                },
                _count: {
                    id: true
                }
            });

            const pendingCommissions = commissionStats.find(stat => stat.status === 'PENDING')?._sum.commissionAmount || 0;
            const approvedCommissions = commissionStats.find(stat => stat.status === 'PAID')?._sum.commissionAmount || 0;

            // Get recent activity (last 10 commissions)
            const recentCommissions = await db.commission.findMany({
                where: {
                    userId: userId
                },
                orderBy: {
                    saleDate: 'desc'
                },
                take: 10,
                select: {
                    commissionAmount: true,
                    saleDate: true,
                    status: true,
                    product: {
                        select: {
                            name: true
                        }
                    }
                }
            });

            const data = {
                stats: {
                    total_earnings: user.totalEarnings,
                    total_clicks: user.totalClicks,
                    total_conversions: user.totalConversions,
                    conversion_rate: user.conversionRate,
                    pending_commissions: pendingCommissions,
                    approved_commissions: approvedCommissions
                },
                recent_activity: recentCommissions.map(comm => ({
                    type: 'commission',
                    amount: comm.commissionAmount,
                    product: comm.product?.name || 'Unknown Product',
                    date: comm.saleDate.toISOString(),
                    status: comm.status
                }))
            };

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Dashboard stats error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch dashboard statistics'
            });
        }
    }

    // Get analytics data
    static async getAnalytics(req, res) {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            const db = getDatabase();

            // Get revenue trend for last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const revenueData = await db.commission.findMany({
                where: {
                    userId: userId,
                    saleDate: {
                        gte: thirtyDaysAgo
                    }
                },
                select: {
                    commissionAmount: true,
                    saleDate: true
                },
                orderBy: {
                    saleDate: 'asc'
                }
            });

            // Group by date
            const revenueTrend = {};
            revenueData.forEach(item => {
                const date = item.saleDate.toISOString().split('T')[0];
                if (!revenueTrend[date]) {
                    revenueTrend[date] = 0;
                }
                revenueTrend[date] += parseFloat(item.commissionAmount);
            });

            const revenueTrendArray = Object.entries(revenueTrend).map(([date, revenue]) => ({
                date,
                revenue
            }));

            // Get top products
            const topProductsData = await db.commission.groupBy({
                by: ['productId'],
                where: {
                    userId: userId,
                    saleDate: {
                        gte: thirtyDaysAgo
                    },
                    productId: {
                        not: null
                    }
                },
                _sum: {
                    commissionAmount: true
                },
                _count: {
                    id: true
                },
                orderBy: {
                    _sum: {
                        commissionAmount: 'desc'
                    }
                },
                take: 10
            });

            // Get product details
            const productIds = topProductsData.map(p => p.productId).filter(id => id !== null);
            const products = await db.product.findMany({
                where: {
                    id: {
                        in: productIds
                    }
                },
                select: {
                    id: true,
                    name: true
                }
            });

            const productMap = {};
            products.forEach(product => {
                productMap[product.id] = product;
            });

            const topProducts = topProductsData.map(product => ({
                name: productMap[product.productId]?.name || 'Unknown Product',
                sales: product._count.id,
                revenue: product._sum.commissionAmount || 0
            }));

            const data = {
                revenue_trend: revenueTrendArray,
                top_products: topProducts
            };

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Analytics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch analytics data'
            });
        }
    }
}
