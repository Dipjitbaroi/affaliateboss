// Analytics Controller
// Contains business logic for all analytics operations using Prisma

import { getDatabase } from '../../lib/prisma.js';

export class AnalyticsController {
    // Get comprehensive dashboard analytics
    static async getDashboardAnalytics(req, res) {
        try {
            const db = getDatabase();
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            // Get user stats
            const user = await db.user.findUnique({
                where: { id: userId },
                select: {
                    totalEarnings: true,
                    totalClicks: true,
                    totalConversions: true,
                    conversionRate: true,
                    createdAt: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                });
            }

            // Get recent commissions (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentCommissions = await db.commission.findMany({
                where: {
                    userId: userId,
                    saleDate: {
                        gte: thirtyDaysAgo
                    }
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
                            name: true,
                            category: true
                        }
                    }
                }
            });

            // Get top performing links
            const topLinks = await db.affiliateLink.findMany({
                where: {
                    userId: userId,
                    status: 'ACTIVE'
                },
                orderBy: {
                    totalClicks: 'desc'
                },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    shortCode: true,
                    totalClicks: true,
                    totalConversions: true,
                    totalEarnings: true,
                    conversionRate: true
                }
            });

            // Calculate monthly stats
            const monthlyStats = await db.commission.groupBy({
                by: ['commissionType'],
                where: {
                    userId: userId,
                    saleDate: {
                        gte: thirtyDaysAgo
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

            const analytics = {
                overview: {
                    totalEarnings: user.totalEarnings,
                    totalClicks: user.totalClicks,
                    totalConversions: user.totalConversions,
                    conversionRate: user.conversionRate,
                    accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
                },
                recentActivity: recentCommissions.map(comm => ({
                    amount: comm.commissionAmount,
                    date: comm.saleDate,
                    status: comm.status,
                    product: comm.product?.name || 'Unknown Product',
                    category: comm.product?.category || 'General'
                })),
                topLinks: topLinks,
                monthlyBreakdown: monthlyStats.map(stat => ({
                    type: stat.commissionType,
                    totalAmount: stat._sum.commissionAmount || 0,
                    totalSales: stat._sum.saleAmount || 0,
                    count: stat._count.id
                }))
            };

            return res.status(200).json({
                success: true,
                message: 'Dashboard analytics retrieved successfully',
                data: analytics
            });

        } catch (error) {
            console.error('Dashboard analytics error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get dashboard analytics',
                error: error.message
            });
        }
    }

    // Get detailed performance analytics
    static async getPerformanceAnalytics(req, res) {
        try {
            const db = getDatabase();
            const userId = req.user?.userId;
            const { period = '30d' } = req.query;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();

            switch (period) {
                case '7d':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(endDate.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(endDate.getDate() - 90);
                    break;
                case '1y':
                    startDate.setFullYear(endDate.getFullYear() - 1);
                    break;
                default:
                    startDate.setDate(endDate.getDate() - 30);
            }

            // Get performance data
            const performanceData = await db.commission.findMany({
                where: {
                    userId: userId,
                    saleDate: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: {
                    commissionAmount: true,
                    saleAmount: true,
                    saleDate: true,
                    commissionType: true,
                    status: true
                },
                orderBy: {
                    saleDate: 'asc'
                }
            });

            // Calculate metrics
            const totalEarnings = performanceData.reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0);
            const totalSales = performanceData.reduce((sum, comm) => sum + parseFloat(comm.saleAmount), 0);
            const totalConversions = performanceData.length;
            const conversionRate = totalConversions > 0 ? (totalEarnings / totalSales) * 100 : 0;

            // Group by date for trend analysis
            const dailyData = {};
            performanceData.forEach(comm => {
                const date = comm.saleDate.toISOString().split('T')[0];
                if (!dailyData[date]) {
                    dailyData[date] = {
                        earnings: 0,
                        sales: 0,
                        conversions: 0
                    };
                }
                dailyData[date].earnings += parseFloat(comm.commissionAmount);
                dailyData[date].sales += parseFloat(comm.saleAmount);
                dailyData[date].conversions += 1;
            });

            const trendData = Object.entries(dailyData).map(([date, data]) => ({
                date,
                earnings: data.earnings,
                sales: data.sales,
                conversions: data.conversions,
                conversionRate: data.sales > 0 ? (data.earnings / data.sales) * 100 : 0
            }));

            // Get top products
            const topProducts = await db.commission.groupBy({
                by: ['productId'],
                where: {
                    userId: userId,
                    saleDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    productId: {
                        not: null
                    }
                },
                _sum: {
                    commissionAmount: true,
                    saleAmount: true
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
            const productIds = topProducts.map(p => p.productId).filter(id => id !== null);
            const products = await db.product.findMany({
                where: {
                    id: {
                        in: productIds
                    }
                },
                select: {
                    id: true,
                    name: true,
                    category: true
                }
            });

            const productMap = {};
            products.forEach(product => {
                productMap[product.id] = product;
            });

            const topProductsWithDetails = topProducts.map(product => ({
                product: productMap[product.productId] || { name: 'Unknown Product', category: 'General' },
                totalEarnings: product._sum.commissionAmount || 0,
                totalSales: product._sum.saleAmount || 0,
                conversions: product._count.id
            }));

            const analytics = {
                period: {
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0],
                    days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
                },
                summary: {
                    totalEarnings,
                    totalSales,
                    totalConversions,
                    conversionRate: parseFloat(conversionRate.toFixed(2)),
                    averageOrderValue: totalConversions > 0 ? totalSales / totalConversions : 0
                },
                trend: trendData,
                topProducts: topProductsWithDetails
            };

            return res.status(200).json({
                success: true,
                message: 'Performance analytics retrieved successfully',
                data: analytics
            });

        } catch (error) {
            console.error('Performance analytics error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get performance analytics',
                error: error.message
            });
        }
    }

    // Get geographic analytics
    static async getGeographicAnalytics(req, res) {
        try {
            const db = getDatabase();
            const userId = req.user?.userId;
            const { period = '30d' } = req.query;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - (period === '7d' ? 7 : period === '90d' ? 90 : 30));

            // Get geographic data from click tracking
            const geoData = await db.clickTracking.findMany({
                where: {
                    userId: userId,
                    clickedAt: {
                        gte: startDate,
                        lte: endDate
                    },
                    country: {
                        not: null
                    }
                },
                select: {
                    country: true,
                    city: true,
                    converted: true,
                    conversionValue: true
                }
            });

            // Aggregate by country
            const countryStats = {};
            geoData.forEach(click => {
                const country = click.country;
                if (!countryStats[country]) {
                    countryStats[country] = {
                        clicks: 0,
                        conversions: 0,
                        revenue: 0
                    };
                }
                countryStats[country].clicks += 1;
                if (click.converted) {
                    countryStats[country].conversions += 1;
                    countryStats[country].revenue += parseFloat(click.conversionValue || 0);
                }
            });

            const countries = Object.entries(countryStats).map(([country, stats]) => ({
                country,
                clicks: stats.clicks,
                conversions: stats.conversions,
                revenue: stats.revenue,
                conversionRate: stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0
            })).sort((a, b) => b.revenue - a.revenue);

            // Get top cities
            const cityStats = {};
            geoData.forEach(click => {
                if (click.city) {
                    const city = click.city;
                    if (!cityStats[city]) {
                        cityStats[city] = {
                            clicks: 0,
                            conversions: 0,
                            revenue: 0,
                            country: click.country
                        };
                    }
                    cityStats[city].clicks += 1;
                    if (click.converted) {
                        cityStats[city].conversions += 1;
                        cityStats[city].revenue += parseFloat(click.conversionValue || 0);
                    }
                }
            });

            const cities = Object.entries(cityStats).map(([city, stats]) => ({
                city,
                country: stats.country,
                clicks: stats.clicks,
                conversions: stats.conversions,
                revenue: stats.revenue,
                conversionRate: stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0
            })).sort((a, b) => b.revenue - a.revenue).slice(0, 20);

            const analytics = {
                period: {
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0]
                },
                countries,
                cities,
                summary: {
                    totalCountries: countries.length,
                    totalCities: cities.length,
                    topCountry: countries[0]?.country || 'N/A',
                    topCountryRevenue: countries[0]?.revenue || 0
                }
            };

            return res.status(200).json({
                success: true,
                message: 'Geographic analytics retrieved successfully',
                data: analytics
            });

        } catch (error) {
            console.error('Geographic analytics error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get geographic analytics',
                error: error.message
            });
        }
    }

    // Get traffic analytics
    static async getTrafficAnalytics(req, res) {
        try {
            const db = getDatabase();
            const userId = req.user?.userId;
            const { period = '30d' } = req.query;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - (period === '7d' ? 7 : period === '90d' ? 90 : 30));

            // Get traffic data from click tracking
            const trafficData = await db.clickTracking.findMany({
                where: {
                    userId: userId,
                    clickedAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: {
                    deviceType: true,
                    browser: true,
                    os: true,
                    referer: true,
                    clickedAt: true,
                    converted: true
                }
            });

            // Aggregate device types
            const deviceStats = {};
            trafficData.forEach(click => {
                const device = click.deviceType || 'Unknown';
                if (!deviceStats[device]) {
                    deviceStats[device] = { clicks: 0, conversions: 0 };
                }
                deviceStats[device].clicks += 1;
                if (click.converted) {
                    deviceStats[device].conversions += 1;
                }
            });

            const devices = Object.entries(deviceStats).map(([device, stats]) => ({
                device,
                clicks: stats.clicks,
                conversions: stats.conversions,
                conversionRate: stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0
            })).sort((a, b) => b.clicks - a.clicks);

            // Aggregate browsers
            const browserStats = {};
            trafficData.forEach(click => {
                const browser = click.browser || 'Unknown';
                if (!browserStats[browser]) {
                    browserStats[browser] = { clicks: 0, conversions: 0 };
                }
                browserStats[browser].clicks += 1;
                if (click.converted) {
                    browserStats[browser].conversions += 1;
                }
            });

            const browsers = Object.entries(browserStats).map(([browser, stats]) => ({
                browser,
                clicks: stats.clicks,
                conversions: stats.conversions,
                conversionRate: stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0
            })).sort((a, b) => b.clicks - a.clicks);

            // Aggregate referrers
            const referrerStats = {};
            trafficData.forEach(click => {
                let referrer = 'Direct';
                if (click.referer) {
                    try {
                        const url = new URL(click.referer);
                        referrer = url.hostname;
                    } catch (e) {
                        referrer = 'Unknown';
                    }
                }
                if (!referrerStats[referrer]) {
                    referrerStats[referrer] = { clicks: 0, conversions: 0 };
                }
                referrerStats[referrer].clicks += 1;
                if (click.converted) {
                    referrerStats[referrer].conversions += 1;
                }
            });

            const referrers = Object.entries(referrerStats).map(([referrer, stats]) => ({
                referrer,
                clicks: stats.clicks,
                conversions: stats.conversions,
                conversionRate: stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0
            })).sort((a, b) => b.clicks - a.clicks).slice(0, 10);

            // Hourly traffic pattern
            const hourlyStats = {};
            trafficData.forEach(click => {
                const hour = click.clickedAt.getHours();
                if (!hourlyStats[hour]) {
                    hourlyStats[hour] = { clicks: 0, conversions: 0 };
                }
                hourlyStats[hour].clicks += 1;
                if (click.converted) {
                    hourlyStats[hour].conversions += 1;
                }
            });

            const hourlyTraffic = Array.from({ length: 24 }, (_, hour) => ({
                hour,
                clicks: hourlyStats[hour]?.clicks || 0,
                conversions: hourlyStats[hour]?.conversions || 0
            }));

            const analytics = {
                period: {
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0]
                },
                devices,
                browsers,
                referrers,
                hourlyTraffic,
                summary: {
                    totalClicks: trafficData.length,
                    totalConversions: trafficData.filter(click => click.converted).length,
                    conversionRate: trafficData.length > 0 ?
                        (trafficData.filter(click => click.converted).length / trafficData.length) * 100 : 0
                }
            };

            return res.status(200).json({
                success: true,
                message: 'Traffic analytics retrieved successfully',
                data: analytics
            });

        } catch (error) {
            console.error('Traffic analytics error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get traffic analytics',
                error: error.message
            });
        }
    }

    // Get conversion analytics
    static async getConversionAnalytics(req, res) {
        try {
            const db = getDatabase();
            const userId = req.user?.userId;
            const { period = '30d' } = req.query;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - (period === '7d' ? 7 : period === '90d' ? 90 : 30));

            // Get conversion data
            const conversions = await db.commission.findMany({
                where: {
                    userId: userId,
                    saleDate: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: {
                    commissionAmount: true,
                    saleAmount: true,
                    saleDate: true,
                    commissionType: true,
                    status: true,
                    product: {
                        select: {
                            name: true,
                            category: true
                        }
                    }
                },
                orderBy: {
                    saleDate: 'desc'
                }
            });

            // Calculate conversion metrics
            const totalConversions = conversions.length;
            const totalRevenue = conversions.reduce((sum, conv) => sum + parseFloat(conv.saleAmount), 0);
            const totalCommission = conversions.reduce((sum, conv) => sum + parseFloat(conv.commissionAmount), 0);
            const averageOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;
            const averageCommission = totalConversions > 0 ? totalCommission / totalConversions : 0;

            // Group by commission type
            const typeStats = {};
            conversions.forEach(conv => {
                const type = conv.commissionType;
                if (!typeStats[type]) {
                    typeStats[type] = {
                        count: 0,
                        revenue: 0,
                        commission: 0
                    };
                }
                typeStats[type].count += 1;
                typeStats[type].revenue += parseFloat(conv.saleAmount);
                typeStats[type].commission += parseFloat(conv.commissionAmount);
            });

            const conversionTypes = Object.entries(typeStats).map(([type, stats]) => ({
                type,
                conversions: stats.count,
                revenue: stats.revenue,
                commission: stats.commission,
                averageOrderValue: stats.revenue / stats.count,
                averageCommission: stats.commission / stats.count
            }));

            // Daily conversion trend
            const dailyConversions = {};
            conversions.forEach(conv => {
                const date = conv.saleDate.toISOString().split('T')[0];
                if (!dailyConversions[date]) {
                    dailyConversions[date] = {
                        conversions: 0,
                        revenue: 0,
                        commission: 0
                    };
                }
                dailyConversions[date].conversions += 1;
                dailyConversions[date].revenue += parseFloat(conv.saleAmount);
                dailyConversions[date].commission += parseFloat(conv.commissionAmount);
            });

            const conversionTrend = Object.entries(dailyConversions).map(([date, data]) => ({
                date,
                conversions: data.conversions,
                revenue: data.revenue,
                commission: data.commission,
                averageOrderValue: data.revenue / data.conversions
            })).sort((a, b) => a.date.localeCompare(b.date));

            // Top converting products
            const productStats = {};
            conversions.forEach(conv => {
                if (conv.product) {
                    const productId = conv.product.name;
                    if (!productStats[productId]) {
                        productStats[productId] = {
                            conversions: 0,
                            revenue: 0,
                            commission: 0,
                            category: conv.product.category
                        };
                    }
                    productStats[productId].conversions += 1;
                    productStats[productId].revenue += parseFloat(conv.saleAmount);
                    productStats[productId].commission += parseFloat(conv.commissionAmount);
                }
            });

            const topProducts = Object.entries(productStats).map(([product, stats]) => ({
                product,
                category: stats.category,
                conversions: stats.conversions,
                revenue: stats.revenue,
                commission: stats.commission,
                conversionRate: stats.conversions > 0 ? (stats.commission / stats.revenue) * 100 : 0
            })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

            const analytics = {
                period: {
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0]
                },
                summary: {
                    totalConversions,
                    totalRevenue,
                    totalCommission,
                    averageOrderValue,
                    averageCommission,
                    conversionRate: totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0
                },
                conversionTypes,
                conversionTrend,
                topProducts,
                recentConversions: conversions.slice(0, 20).map(conv => ({
                    date: conv.saleDate,
                    product: conv.product?.name || 'Unknown Product',
                    category: conv.product?.category || 'General',
                    revenue: conv.saleAmount,
                    commission: conv.commissionAmount,
                    type: conv.commissionType,
                    status: conv.status
                }))
            };

            return res.status(200).json({
                success: true,
                message: 'Conversion analytics retrieved successfully',
                data: analytics
            });

        } catch (error) {
            console.error('Conversion analytics error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get conversion analytics',
                error: error.message
            });
        }
    }

    // Get revenue analytics
    static async getRevenueAnalytics(req, res) {
        try {
            const db = getDatabase();
            const userId = req.user?.userId;
            const { period = '30d' } = req.query;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - (period === '7d' ? 7 : period === '90d' ? 90 : 30));

            // Get revenue data
            const revenueData = await db.commission.findMany({
                where: {
                    userId: userId,
                    saleDate: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: {
                    commissionAmount: true,
                    saleAmount: true,
                    saleDate: true,
                    commissionType: true,
                    status: true,
                    product: {
                        select: {
                            name: true,
                            category: true
                        }
                    }
                },
                orderBy: {
                    saleDate: 'asc'
                }
            });

            // Calculate revenue metrics
            const totalRevenue = revenueData.reduce((sum, item) => sum + parseFloat(item.saleAmount), 0);
            const totalCommission = revenueData.reduce((sum, item) => sum + parseFloat(item.commissionAmount), 0);
            const commissionRate = totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0;

            // Revenue by date
            const dailyRevenue = {};
            revenueData.forEach(item => {
                const date = item.saleDate.toISOString().split('T')[0];
                if (!dailyRevenue[date]) {
                    dailyRevenue[date] = {
                        revenue: 0,
                        commission: 0,
                        transactions: 0
                    };
                }
                dailyRevenue[date].revenue += parseFloat(item.saleAmount);
                dailyRevenue[date].commission += parseFloat(item.commissionAmount);
                dailyRevenue[date].transactions += 1;
            });

            const revenueTrend = Object.entries(dailyRevenue).map(([date, data]) => ({
                date,
                revenue: data.revenue,
                commission: data.commission,
                transactions: data.transactions,
                averageOrderValue: data.revenue / data.transactions
            })).sort((a, b) => a.date.localeCompare(b.date));

            // Revenue by product category
            const categoryRevenue = {};
            revenueData.forEach(item => {
                const category = item.product?.category || 'General';
                if (!categoryRevenue[category]) {
                    categoryRevenue[category] = {
                        revenue: 0,
                        commission: 0,
                        transactions: 0
                    };
                }
                categoryRevenue[category].revenue += parseFloat(item.saleAmount);
                categoryRevenue[category].commission += parseFloat(item.commissionAmount);
                categoryRevenue[category].transactions += 1;
            });

            const revenueByCategory = Object.entries(categoryRevenue).map(([category, data]) => ({
                category,
                revenue: data.revenue,
                commission: data.commission,
                transactions: data.transactions,
                commissionRate: (data.commission / data.revenue) * 100
            })).sort((a, b) => b.revenue - a.revenue);

            // Revenue by commission type
            const typeRevenue = {};
            revenueData.forEach(item => {
                const type = item.commissionType;
                if (!typeRevenue[type]) {
                    typeRevenue[type] = {
                        revenue: 0,
                        commission: 0,
                        transactions: 0
                    };
                }
                typeRevenue[type].revenue += parseFloat(item.saleAmount);
                typeRevenue[type].commission += parseFloat(item.commissionAmount);
                typeRevenue[type].transactions += 1;
            });

            const revenueByType = Object.entries(typeRevenue).map(([type, data]) => ({
                type,
                revenue: data.revenue,
                commission: data.commission,
                transactions: data.transactions,
                commissionRate: (data.commission / data.revenue) * 100
            })).sort((a, b) => b.revenue - a.revenue);

            // Monthly comparison (current vs previous period)
            const previousPeriodStart = new Date(startDate);
            previousPeriodStart.setDate(previousPeriodStart.getDate() - (period === '7d' ? 7 : period === '90d' ? 90 : 30));

            const previousRevenueData = await db.commission.findMany({
                where: {
                    userId: userId,
                    saleDate: {
                        gte: previousPeriodStart,
                        lt: startDate
                    }
                },
                select: {
                    commissionAmount: true,
                    saleAmount: true
                }
            });

            const previousTotalRevenue = previousRevenueData.reduce((sum, item) => sum + parseFloat(item.saleAmount), 0);
            const previousTotalCommission = previousRevenueData.reduce((sum, item) => sum + parseFloat(item.commissionAmount), 0);

            const comparison = {
                currentPeriod: {
                    revenue: totalRevenue,
                    commission: totalCommission,
                    transactions: revenueData.length
                },
                previousPeriod: {
                    revenue: previousTotalRevenue,
                    commission: previousTotalCommission,
                    transactions: previousRevenueData.length
                },
                growth: {
                    revenue: previousTotalRevenue > 0 ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 : 0,
                    commission: previousTotalCommission > 0 ? ((totalCommission - previousTotalCommission) / previousTotalCommission) * 100 : 0,
                    transactions: previousRevenueData.length > 0 ? ((revenueData.length - previousRevenueData.length) / previousRevenueData.length) * 100 : 0
                }
            };

            const analytics = {
                period: {
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0]
                },
                summary: {
                    totalRevenue,
                    totalCommission,
                    commissionRate,
                    totalTransactions: revenueData.length,
                    averageOrderValue: revenueData.length > 0 ? totalRevenue / revenueData.length : 0,
                    averageCommission: revenueData.length > 0 ? totalCommission / revenueData.length : 0
                },
                revenueTrend,
                revenueByCategory,
                revenueByType,
                comparison
            };

            return res.status(200).json({
                success: true,
                message: 'Revenue analytics retrieved successfully',
                data: analytics
            });

        } catch (error) {
            console.error('Revenue analytics error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get revenue analytics',
                error: error.message
            });
        }
    }

    // Get trend analytics
    static async getTrendAnalytics(req, res) {
        try {
            const db = getDatabase();
            const userId = req.user?.userId;
            const { period = '90d', metric = 'revenue' } = req.query;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
            startDate.setDate(endDate.getDate() - days);

            // Get trend data
            const trendData = await db.commission.findMany({
                where: {
                    userId: userId,
                    saleDate: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: {
                    commissionAmount: true,
                    saleAmount: true,
                    saleDate: true,
                    commissionType: true,
                    status: true
                },
                orderBy: {
                    saleDate: 'asc'
                }
            });

            // Group data by date
            const dailyData = {};
            trendData.forEach(item => {
                const date = item.saleDate.toISOString().split('T')[0];
                if (!dailyData[date]) {
                    dailyData[date] = {
                        revenue: 0,
                        commission: 0,
                        conversions: 0,
                        transactions: 0
                    };
                }
                dailyData[date].revenue += parseFloat(item.saleAmount);
                dailyData[date].commission += parseFloat(item.commissionAmount);
                dailyData[date].conversions += 1;
                dailyData[date].transactions += 1;
            });

            // Fill in missing dates with zeros
            const allDates = [];
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                allDates.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            const completeTrendData = allDates.map(date => ({
                date,
                revenue: dailyData[date]?.revenue || 0,
                commission: dailyData[date]?.commission || 0,
                conversions: dailyData[date]?.conversions || 0,
                transactions: dailyData[date]?.transactions || 0,
                conversionRate: dailyData[date]?.transactions > 0 ?
                    (dailyData[date].commission / dailyData[date].revenue) * 100 : 0
            }));

            // Calculate moving averages
            const movingAveragePeriod = 7; // 7-day moving average
            const movingAverages = completeTrendData.map((item, index) => {
                if (index < movingAveragePeriod - 1) return null;

                const slice = completeTrendData.slice(index - movingAveragePeriod + 1, index + 1);
                const avgRevenue = slice.reduce((sum, d) => sum + d.revenue, 0) / movingAveragePeriod;
                const avgCommission = slice.reduce((sum, d) => sum + d.commission, 0) / movingAveragePeriod;
                const avgConversions = slice.reduce((sum, d) => sum + d.conversions, 0) / movingAveragePeriod;

                return {
                    date: item.date,
                    revenue: avgRevenue,
                    commission: avgCommission,
                    conversions: avgConversions,
                    conversionRate: avgRevenue > 0 ? (avgCommission / avgRevenue) * 100 : 0
                };
            }).filter(item => item !== null);

            // Calculate growth rates
            const growthRates = completeTrendData.map((item, index) => {
                if (index === 0) return { ...item, growthRate: 0 };

                const previousValue = completeTrendData[index - 1][metric] || 0;
                const currentValue = item[metric] || 0;
                const growthRate = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

                return {
                    ...item,
                    growthRate
                };
            });

            // Identify trends
            const recentData = completeTrendData.slice(-14); // Last 14 days
            const olderData = completeTrendData.slice(-28, -14); // Previous 14 days

            const recentAvg = recentData.reduce((sum, d) => sum + d[metric], 0) / recentData.length;
            const olderAvg = olderData.reduce((sum, d) => sum + d[metric], 0) / olderData.length;

            const trend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
            const trendDirection = trend > 5 ? 'up' : trend < -5 ? 'down' : 'stable';

            // Seasonal patterns (by day of week)
            const dayOfWeekData = {};
            completeTrendData.forEach(item => {
                const dayOfWeek = new Date(item.date).getDay();
                if (!dayOfWeekData[dayOfWeek]) {
                    dayOfWeekData[dayOfWeek] = [];
                }
                dayOfWeekData[dayOfWeek].push(item);
            });

            const weeklyPatterns = Object.entries(dayOfWeekData).map(([day, data]) => {
                const avgValue = data.reduce((sum, d) => sum + d[metric], 0) / data.length;
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return {
                    day: dayNames[parseInt(day)],
                    average: avgValue,
                    dataPoints: data.length
                };
            });

            const analytics = {
                period: {
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0],
                    days
                },
                metric,
                trendData: completeTrendData,
                movingAverages,
                growthRates,
                trend: {
                    direction: trendDirection,
                    percentage: trend,
                    recentAverage: recentAvg,
                    olderAverage: olderAvg
                },
                weeklyPatterns,
                summary: {
                    totalValue: completeTrendData.reduce((sum, d) => sum + d[metric], 0),
                    averageDaily: completeTrendData.reduce((sum, d) => sum + d[metric], 0) / completeTrendData.length,
                    maxValue: Math.max(...completeTrendData.map(d => d[metric])),
                    minValue: Math.min(...completeTrendData.map(d => d[metric])),
                    volatility: calculateVolatility(completeTrendData.map(d => d[metric]))
                }
            };

            return res.status(200).json({
                success: true,
                message: 'Trend analytics retrieved successfully',
                data: analytics
            });

        } catch (error) {
            console.error('Trend analytics error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get trend analytics',
                error: error.message
            });
        }
    }

    // Get reports
    static async getReports(req, res) {
        try {
            const db = getDatabase();
            const userId = req.user?.userId;
            const { type = 'summary', format = 'json' } = req.query;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            let reportData = {};

            switch (type) {
                case 'summary':
                    reportData = await this.generateSummaryReport(db, userId);
                    break;
                case 'performance':
                    reportData = await this.generatePerformanceReport(db, userId);
                    break;
                case 'revenue':
                    reportData = await this.generateRevenueReport(db, userId);
                    break;
                case 'links':
                    reportData = await this.generateLinksReport(db, userId);
                    break;
                default:
                    reportData = await this.generateSummaryReport(db, userId);
            }

            if (format === 'csv') {
                // Generate CSV format
                const csv = this.convertToCSV(reportData);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.csv"');
                return res.status(200).send(csv);
            }

            return res.status(200).json({
                success: true,
                message: 'Report generated successfully',
                data: reportData
            });

        } catch (error) {
            console.error('Reports error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate report',
                error: error.message
            });
        }
    }

    static async generateSummaryReport(db, userId) {
        // Get user overview
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
                email: true,
                totalEarnings: true,
                totalClicks: true,
                totalConversions: true,
                conversionRate: true,
                createdAt: true
            }
        });

        // Get recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentCommissions = await db.commission.findMany({
            where: {
                userId: userId,
                saleDate: {
                    gte: thirtyDaysAgo
                }
            },
            select: {
                commissionAmount: true,
                saleAmount: true,
                saleDate: true
            }
        });

        const recentRevenue = recentCommissions.reduce((sum, comm) => sum + parseFloat(comm.saleAmount), 0);
        const recentCommission = recentCommissions.reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0);

        return {
            reportType: 'Summary Report',
            generatedAt: new Date().toISOString(),
            user: {
                username: user.username,
                email: user.email,
                memberSince: user.createdAt
            },
            overview: {
                totalEarnings: user.totalEarnings,
                totalClicks: user.totalClicks,
                totalConversions: user.totalConversions,
                conversionRate: user.conversionRate
            },
            recentActivity: {
                period: 'Last 30 days',
                totalRevenue: recentRevenue,
                totalCommission: recentCommission,
                transactionCount: recentCommissions.length,
                averageOrderValue: recentCommissions.length > 0 ? recentRevenue / recentCommissions.length : 0
            }
        };
    }

    static async generatePerformanceReport(db, userId) {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const performanceData = await db.commission.findMany({
            where: {
                userId: userId,
                saleDate: {
                    gte: ninetyDaysAgo
                }
            },
            select: {
                commissionAmount: true,
                saleAmount: true,
                saleDate: true,
                commissionType: true,
                product: {
                    select: {
                        name: true,
                        category: true
                    }
                }
            },
            orderBy: {
                saleDate: 'desc'
            }
        });

        const monthlyData = {};
        performanceData.forEach(item => {
            const month = item.saleDate.toISOString().slice(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    revenue: 0,
                    commission: 0,
                    transactions: 0
                };
            }
            monthlyData[month].revenue += parseFloat(item.saleAmount);
            monthlyData[month].commission += parseFloat(item.commissionAmount);
            monthlyData[month].transactions += 1;
        });

        return {
            reportType: 'Performance Report',
            generatedAt: new Date().toISOString(),
            period: 'Last 90 days',
            monthlyBreakdown: Object.entries(monthlyData).map(([month, data]) => ({
                month,
                revenue: data.revenue,
                commission: data.commission,
                transactions: data.transactions,
                averageOrderValue: data.revenue / data.transactions
            })),
            topProducts: await this.getTopProducts(db, userId, ninetyDaysAgo)
        };
    }

    static async generateRevenueReport(db, userId) {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const revenueData = await db.commission.findMany({
            where: {
                userId: userId,
                saleDate: {
                    gte: oneYearAgo
                }
            },
            select: {
                commissionAmount: true,
                saleAmount: true,
                saleDate: true,
                commissionType: true
            }
        });

        const yearlyRevenue = revenueData.reduce((sum, item) => sum + parseFloat(item.saleAmount), 0);
        const yearlyCommission = revenueData.reduce((sum, item) => sum + parseFloat(item.commissionAmount), 0);

        return {
            reportType: 'Revenue Report',
            generatedAt: new Date().toISOString(),
            period: 'Last 12 months',
            summary: {
                totalRevenue: yearlyRevenue,
                totalCommission: yearlyCommission,
                commissionRate: yearlyRevenue > 0 ? (yearlyCommission / yearlyRevenue) * 100 : 0,
                transactionCount: revenueData.length
            },
            monthlyRevenue: this.groupByMonth(revenueData)
        };
    }

    static async generateLinksReport(db, userId) {
        const links = await db.affiliateLink.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                name: true,
                shortCode: true,
                totalClicks: true,
                totalConversions: true,
                totalEarnings: true,
                conversionRate: true,
                status: true,
                createdAt: true
            },
            orderBy: {
                totalClicks: 'desc'
            }
        });

        return {
            reportType: 'Links Report',
            generatedAt: new Date().toISOString(),
            totalLinks: links.length,
            activeLinks: links.filter(link => link.status === 'ACTIVE').length,
            links: links.map(link => ({
                name: link.name,
                shortCode: link.shortCode,
                clicks: link.totalClicks,
                conversions: link.totalConversions,
                earnings: link.totalEarnings,
                conversionRate: link.conversionRate,
                status: link.status,
                createdAt: link.createdAt
            }))
        };
    }

    static async getTopProducts(db, userId, startDate) {
        const productStats = await db.commission.groupBy({
            by: ['productId'],
            where: {
                userId: userId,
                saleDate: {
                    gte: startDate
                },
                productId: {
                    not: null
                }
            },
            _sum: {
                commissionAmount: true,
                saleAmount: true
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

        const productIds = productStats.map(p => p.productId).filter(id => id !== null);
        const products = await db.product.findMany({
            where: {
                id: {
                    in: productIds
                }
            },
            select: {
                id: true,
                name: true,
                category: true
            }
        });

        const productMap = {};
        products.forEach(product => {
            productMap[product.id] = product;
        });

        return productStats.map(stat => ({
            product: productMap[stat.productId] || { name: 'Unknown Product', category: 'General' },
            revenue: stat._sum.saleAmount || 0,
            commission: stat._sum.commissionAmount || 0,
            conversions: stat._count.id
        }));
    }

    static groupByMonth(data) {
        const monthlyData = {};
        data.forEach(item => {
            const month = item.saleDate.toISOString().slice(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    revenue: 0,
                    commission: 0,
                    transactions: 0
                };
            }
            monthlyData[month].revenue += parseFloat(item.saleAmount);
            monthlyData[month].commission += parseFloat(item.commissionAmount);
            monthlyData[month].transactions += 1;
        });

        return Object.entries(monthlyData).map(([month, data]) => ({
            month,
            revenue: data.revenue,
            commission: data.commission,
            transactions: data.transactions
        }));
    }

    static convertToCSV(data) {
        // Simple CSV conversion - in production, use a proper CSV library
        let csv = 'Report Type,Generated At\n';
        csv += `${data.reportType},${data.generatedAt}\n\n`;

        if (data.overview) {
            csv += 'Overview\n';
            csv += 'Metric,Value\n';
            Object.entries(data.overview).forEach(([key, value]) => {
                csv += `${key},${value}\n`;
            });
            csv += '\n';
        }

        return csv;
    }

    // Export analytics
    static async exportAnalytics(req, res) {
        // This would implement various export formats (CSV, PDF, Excel)
        return res.status(200).json({
            success: true,
            message: 'Export functionality - coming soon',
            supportedFormats: ['json', 'csv']
        });
    }

    // Generate custom report
    static async generateCustomReport(req, res) {
        try {
            const db = getDatabase();
            const userId = req.user?.userId;
            const { startDate, endDate, metrics = ['revenue', 'commission', 'conversions'], groupBy = 'day' } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            const reportData = await db.commission.findMany({
                where: {
                    userId: userId,
                    saleDate: {
                        gte: start,
                        lte: end
                    }
                },
                select: {
                    commissionAmount: true,
                    saleAmount: true,
                    saleDate: true,
                    commissionType: true
                },
                orderBy: {
                    saleDate: 'asc'
                }
            });

            // Group data based on groupBy parameter
            const groupedData = {};
            reportData.forEach(item => {
                let key;
                switch (groupBy) {
                    case 'month':
                        key = item.saleDate.toISOString().slice(0, 7);
                        break;
                    case 'week':
                        const weekStart = new Date(item.saleDate);
                        weekStart.setDate(item.saleDate.getDate() - item.saleDate.getDay());
                        key = weekStart.toISOString().slice(0, 10);
                        break;
                    case 'day':
                    default:
                        key = item.saleDate.toISOString().slice(0, 10);
                        break;
                }

                if (!groupedData[key]) {
                    groupedData[key] = {
                        revenue: 0,
                        commission: 0,
                        conversions: 0,
                        transactions: 0
                    };
                }

                if (metrics.includes('revenue')) {
                    groupedData[key].revenue += parseFloat(item.saleAmount);
                }
                if (metrics.includes('commission')) {
                    groupedData[key].commission += parseFloat(item.commissionAmount);
                }
                if (metrics.includes('conversions')) {
                    groupedData[key].conversions += 1;
                }
                groupedData[key].transactions += 1;
            });

            const customReport = {
                reportType: 'Custom Report',
                generatedAt: new Date().toISOString(),
                parameters: {
                    startDate: startDate,
                    endDate: endDate,
                    metrics,
                    groupBy
                },
                data: Object.entries(groupedData).map(([period, data]) => ({
                    period,
                    ...data
                })).sort((a, b) => a.period.localeCompare(b.period))
            };

            return res.status(200).json({
                success: true,
                message: 'Custom report generated successfully',
                data: customReport
            });

        } catch (error) {
            console.error('Custom report error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate custom report',
                error: error.message
            });
        }
    }
}

// Helper function to calculate volatility
function calculateVolatility(values) {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, sq) => sum + sq, 0) / values.length;

    return Math.sqrt(variance);
}
