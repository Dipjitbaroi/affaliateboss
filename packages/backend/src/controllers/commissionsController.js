// Commissions Controller
// Contains business logic for commission tracking operations

import { getDatabase } from '../../lib/prisma.js';

export class CommissionsController {
    // Get all commissions for the authenticated user
    static async getCommissions(req, res) {
        try {
            const userId = req.user?.userId;
            const { status, limit = 50, offset = 0, startDate, endDate } = req.query;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            const db = getDatabase();

            const where = { userId: userId };

            if (status) {
                where.status = status.toUpperCase();
            }

            if (startDate || endDate) {
                where.saleDate = {};
                if (startDate) {
                    where.saleDate.gte = new Date(startDate);
                }
                if (endDate) {
                    where.saleDate.lte = new Date(endDate);
                }
            }

            const commissions = await db.commission.findMany({
                where,
                select: {
                    id: true,
                    saleDate: true,
                    saleAmount: true,
                    commissionRate: true,
                    commissionAmount: true,
                    status: true,
                    product: {
                        select: {
                            name: true,
                            category: true
                        }
                    },
                    link: {
                        select: {
                            name: true
                        }
                    },
                    orderId: true,
                    customerEmail: true,
                    createdAt: true
                },
                orderBy: {
                    saleDate: 'desc'
                },
                take: parseInt(limit),
                skip: parseInt(offset)
            });

            const data = commissions.map(commission => ({
                id: commission.id,
                date: commission.saleDate.toISOString().split('T')[0],
                product: commission.product?.name || 'Unknown Product',
                category: commission.product?.category || 'General',
                link: commission.link?.name || 'Direct',
                customer: commission.customerEmail || 'N/A',
                order_id: commission.orderId,
                sale_amount: commission.saleAmount,
                rate: `${commission.commissionRate}%`,
                commission: commission.commissionAmount,
                status: commission.status.toLowerCase(),
                created_at: commission.createdAt.toISOString()
            }));

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get commissions error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch commissions'
            });
        }
    }

    // Get single commission by ID
    static async getCommission(req, res) {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            const db = getDatabase();

            const commission = await db.commission.findFirst({
                where: {
                    id: parseInt(id),
                    userId: userId
                },
                select: {
                    id: true,
                    saleDate: true,
                    saleAmount: true,
                    commissionRate: true,
                    commissionAmount: true,
                    status: true,
                    commissionType: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            category: true
                        }
                    },
                    link: {
                        select: {
                            id: true,
                            name: true,
                            shortCode: true
                        }
                    },
                    orderId: true,
                    shopifyOrderId: true,
                    customerEmail: true,
                    customerCountry: true,
                    referrerSource: true,
                    deviceType: true,
                    paymentStatus: true,
                    confirmedDate: true,
                    paidDate: true,
                    createdAt: true
                }
            });

            if (!commission) {
                return res.status(404).json({
                    success: false,
                    message: 'Commission not found',
                    error: 'COMMISSION_NOT_FOUND'
                });
            }

            const data = {
                id: commission.id,
                date: commission.saleDate.toISOString().split('T')[0],
                product: commission.product ? {
                    id: commission.product.id,
                    name: commission.product.name,
                    category: commission.product.category
                } : null,
                link: commission.link ? {
                    id: commission.link.id,
                    name: commission.link.name,
                    short_code: commission.link.shortCode
                } : null,
                order_id: commission.orderId,
                shopify_order_id: commission.shopifyOrderId,
                customer_email: commission.customerEmail,
                customer_country: commission.customerCountry,
                referrer_source: commission.referrerSource,
                device_type: commission.deviceType,
                sale_amount: commission.saleAmount,
                commission_rate: commission.commissionRate,
                commission_amount: commission.commissionAmount,
                commission_type: commission.commissionType,
                status: commission.status.toLowerCase(),
                payment_status: commission.paymentStatus.toLowerCase(),
                confirmed_date: commission.confirmedDate?.toISOString(),
                paid_date: commission.paidDate?.toISOString(),
                created_at: commission.createdAt.toISOString()
            };

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get commission error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch commission'
            });
        }
    }

    // Get commission statistics
    static async getCommissionStats(req, res) {
        try {
            const userId = req.user?.userId;
            const { period = '30d' } = req.query;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            const db = getDatabase();

            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
            startDate.setDate(endDate.getDate() - days);

            // Get commission statistics
            const stats = await db.commission.groupBy({
                by: ['status'],
                where: {
                    userId: userId,
                    saleDate: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    commissionAmount: true,
                    saleAmount: true
                },
                _count: {
                    id: true
                }
            });

            const totalStats = await db.commission.aggregate({
                where: {
                    userId: userId,
                    saleDate: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    commissionAmount: true,
                    saleAmount: true
                },
                _count: {
                    id: true
                }
            });

            const data = {
                period: {
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0],
                    days
                },
                summary: {
                    total_commissions: totalStats._count.id,
                    total_sales: totalStats._sum.saleAmount || 0,
                    total_earnings: totalStats._sum.commissionAmount || 0,
                    average_commission: totalStats._count.id > 0 ?
                        (totalStats._sum.commissionAmount || 0) / totalStats._count.id : 0
                },
                by_status: stats.map(stat => ({
                    status: stat.status.toLowerCase(),
                    count: stat._count.id,
                    amount: stat._sum.commissionAmount || 0,
                    sales: stat._sum.saleAmount || 0
                }))
            };

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get commission stats error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch commission statistics'
            });
        }
    }

    // Update commission status
    static async updateCommissionStatus(req, res) {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            const { status } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required',
                    error: 'MISSING_STATUS'
                });
            }

            const db = getDatabase();

            const updateData = {
                status: status.toUpperCase()
            };

            // Set confirmed or paid date based on status
            if (status.toUpperCase() === 'CONFIRMED') {
                updateData.confirmedDate = new Date();
            } else if (status.toUpperCase() === 'PAID') {
                updateData.paidDate = new Date();
                updateData.paymentStatus = 'PAID';
            }

            const updatedCommission = await db.commission.updateMany({
                where: {
                    id: parseInt(id),
                    userId: userId
                },
                data: updateData
            });

            if (updatedCommission.count === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Commission not found or unauthorized',
                    error: 'COMMISSION_NOT_FOUND'
                });
            }

            res.json({
                success: true,
                message: 'Commission status updated successfully'
            });
        } catch (error) {
            console.error('Update commission status error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update commission status'
            });
        }
    }
}
