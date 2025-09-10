// Profile Controller
// Contains business logic for user profile operations

import { getDatabase } from '../../lib/prisma.js';

export class ProfileController {
    // Get user profile information
    static async getProfile(req, res) {
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

            const user = await db.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    phone: true,
                    firstName: true,
                    lastName: true,
                    tier: true,
                    status: true,
                    totalEarnings: true,
                    totalClicks: true,
                    totalConversions: true,
                    conversionRate: true,
                    emailVerified: true,
                    phoneVerified: true,
                    avatarUrl: true,
                    bio: true,
                    website: true,
                    timezone: true,
                    language: true,
                    currency: true,
                    createdAt: true,
                    updatedAt: true,
                    lastLogin: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                });
            }

            // Get user settings
            const userSettings = await db.userSettings.findUnique({
                where: { userId: userId },
                select: {
                    timezone: true,
                    language: true,
                    currency: true,
                    dateFormat: true,
                    timeFormat: true,
                    profileVisibility: true,
                    showEarningsPublicly: true,
                    showStatisticsPublicly: true,
                    allowContactFromOthers: true,
                    marketingEmails: true,
                    twoFactorEnabled: true,
                    twoFactorMethod: true,
                    minimumPayout: true,
                    autoPayoutEnabled: true,
                    autoPayoutFrequency: true,
                    defaultPayoutMethodId: true
                }
            });

            // Get default payment method
            let defaultPaymentMethod = null;
            if (userSettings?.defaultPayoutMethodId) {
                defaultPaymentMethod = await db.paymentMethod.findUnique({
                    where: { id: userSettings.defaultPayoutMethodId },
                    select: {
                        type: true,
                        provider: true,
                        name: true
                    }
                });
            }

            const data = {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                first_name: user.firstName,
                last_name: user.lastName,
                full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                tier: user.tier,
                status: user.status,
                total_earnings: user.totalEarnings,
                total_clicks: user.totalClicks,
                total_conversions: user.totalConversions,
                conversion_rate: user.conversionRate,
                email_verified: user.emailVerified,
                phone_verified: user.phoneVerified,
                avatar_url: user.avatarUrl,
                bio: user.bio,
                website: user.website,
                timezone: user.timezone,
                language: user.language,
                currency: user.currency,
                joined_date: user.createdAt.toISOString().split('T')[0],
                last_login: user.lastLogin?.toISOString(),
                settings: userSettings,
                default_payment_method: defaultPaymentMethod ? {
                    type: defaultPaymentMethod.type,
                    provider: defaultPaymentMethod.provider,
                    name: defaultPaymentMethod.name
                } : null
            };

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch profile'
            });
        }
    }

    // Update user profile
    static async updateProfile(req, res) {
        try {
            const userId = req.user?.userId;
            const {
                firstName,
                lastName,
                phone,
                bio,
                website,
                timezone,
                language,
                currency,
                avatarUrl
            } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            const db = getDatabase();

            const updatedUser = await db.user.update({
                where: { id: userId },
                data: {
                    ...(firstName !== undefined && { firstName }),
                    ...(lastName !== undefined && { lastName }),
                    ...(phone !== undefined && { phone }),
                    ...(bio !== undefined && { bio }),
                    ...(website !== undefined && { website }),
                    ...(timezone !== undefined && { timezone }),
                    ...(language !== undefined && { language }),
                    ...(currency !== undefined && { currency }),
                    ...(avatarUrl !== undefined && { avatarUrl }),
                    updatedAt: new Date()
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    phone: true,
                    firstName: true,
                    lastName: true,
                    bio: true,
                    website: true,
                    timezone: true,
                    language: true,
                    currency: true,
                    avatarUrl: true,
                    updatedAt: true
                }
            });

            const data = {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                phone: updatedUser.phone,
                first_name: updatedUser.firstName,
                last_name: updatedUser.lastName,
                full_name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
                bio: updatedUser.bio,
                website: updatedUser.website,
                timezone: updatedUser.timezone,
                language: updatedUser.language,
                currency: updatedUser.currency,
                avatar_url: updatedUser.avatarUrl,
                updated_at: updatedUser.updatedAt.toISOString()
            };

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: data
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update profile'
            });
        }
    }

    // Update user settings
    static async updateSettings(req, res) {
        try {
            const userId = req.user?.userId;
            const settings = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            const db = getDatabase();

            const updatedSettings = await db.userSettings.upsert({
                where: { userId: userId },
                update: {
                    ...settings,
                    updatedAt: new Date()
                },
                create: {
                    userId: userId,
                    ...settings
                }
            });

            res.json({
                success: true,
                message: 'Settings updated successfully',
                data: updatedSettings
            });
        } catch (error) {
            console.error('Update settings error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update settings'
            });
        }
    }

    // Get user statistics
    static async getStatistics(req, res) {
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
                    conversionRate: true,
                    createdAt: true
                }
            });

            // Get monthly stats for the last 12 months
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

            const monthlyStats = await db.commission.findMany({
                where: {
                    userId: userId,
                    saleDate: {
                        gte: twelveMonthsAgo
                    }
                },
                select: {
                    saleDate: true,
                    commissionAmount: true,
                    saleAmount: true
                }
            });

            // Group by month
            const monthlyData = {};
            monthlyStats.forEach(stat => {
                const month = stat.saleDate.toISOString().slice(0, 7); // YYYY-MM
                if (!monthlyData[month]) {
                    monthlyData[month] = {
                        earnings: 0,
                        sales: 0,
                        commissions: 0
                    };
                }
                monthlyData[month].earnings += parseFloat(stat.commissionAmount);
                monthlyData[month].sales += parseFloat(stat.saleAmount);
                monthlyData[month].commissions += 1;
            });

            const monthlyBreakdown = Object.entries(monthlyData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, data]) => ({
                    month,
                    earnings: data.earnings,
                    sales: data.sales,
                    commissions: data.commissions
                }));

            // Get top performing links
            const topLinks = await db.affiliateLink.findMany({
                where: {
                    userId: userId,
                    status: 'ACTIVE'
                },
                select: {
                    id: true,
                    name: true,
                    totalClicks: true,
                    totalConversions: true,
                    totalEarnings: true
                },
                orderBy: {
                    totalEarnings: 'desc'
                },
                take: 5
            });

            const data = {
                overview: {
                    total_earnings: user.totalEarnings,
                    total_clicks: user.totalClicks,
                    total_conversions: user.totalConversions,
                    conversion_rate: user.conversionRate,
                    account_age_days: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
                },
                monthly_breakdown: monthlyBreakdown,
                top_links: topLinks.map(link => ({
                    id: link.id,
                    name: link.name,
                    clicks: link.totalClicks,
                    conversions: link.totalConversions,
                    earnings: link.totalEarnings
                }))
            };

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get statistics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch statistics'
            });
        }
    }
}
