// Referrals Controller
// Contains business logic for referral system operations

import { getDatabase } from '../../lib/prisma.js';

export class ReferralsController {
    // Get referral statistics and data
    static async getReferrals(req, res) {
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

            // Get referral commissions (commissions with type REFERRAL or TIER_BONUS)
            const referralCommissions = await db.commission.findMany({
                where: {
                    userId: userId,
                    commissionType: {
                        in: ['REFERRAL', 'TIER_BONUS']
                    }
                },
                select: {
                    id: true,
                    commissionAmount: true,
                    saleDate: true,
                    commissionType: true,
                    status: true,
                    customerEmail: true,
                    createdAt: true
                },
                orderBy: {
                    saleDate: 'desc'
                }
            });

            // Calculate referral statistics
            const totalReferrals = referralCommissions.length;
            const totalEarnings = referralCommissions.reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0);
            const activeReferrals = referralCommissions.filter(comm => comm.status === 'PAID').length;
            const tierBonuses = referralCommissions
                .filter(comm => comm.commissionType === 'TIER_BONUS')
                .reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0);

            // Group by month for trend analysis
            const monthlyData = {};
            referralCommissions.forEach(comm => {
                const month = comm.saleDate.toISOString().slice(0, 7);
                if (!monthlyData[month]) {
                    monthlyData[month] = {
                        count: 0,
                        earnings: 0
                    };
                }
                monthlyData[month].count += 1;
                monthlyData[month].earnings += parseFloat(comm.commissionAmount);
            });

            const monthlyBreakdown = Object.entries(monthlyData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, data]) => ({
                    month,
                    referrals: data.count,
                    earnings: data.earnings
                }));

            const data = {
                stats: {
                    total_referrals: totalReferrals,
                    referral_earnings: totalEarnings,
                    active_referrals: activeReferrals,
                    tier_bonuses: tierBonuses
                },
                referrals: referralCommissions.map(comm => ({
                    id: comm.id,
                    customer_email: comm.customerEmail || 'N/A',
                    join_date: comm.saleDate.toISOString().split('T')[0],
                    status: comm.status.toLowerCase(),
                    earnings: comm.commissionAmount,
                    commission_type: comm.commissionType,
                    created_at: comm.createdAt.toISOString()
                })),
                monthly_breakdown: monthlyBreakdown
            };

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get referrals error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch referrals'
            });
        }
    }

    // Get referral link/code for the user
    static async getReferralLink(req, res) {
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
                    apiKey: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                });
            }

            const referralCode = user.apiKey || `ref_${user.username}_${user.id}`;
            const referralLink = `${process.env.FRONTEND_URL || 'https://affiliateboss.com'}/register?ref=${referralCode}`;

            const data = {
                referral_code: referralCode,
                referral_link: referralLink,
                user_id: user.id
            };

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get referral link error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate referral link'
            });
        }
    }

    // Get referral program details
    static async getReferralProgram(req, res) {
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
                    tier: true
                }
            });

            // Define referral rates based on user tier
            const referralRates = {
                BRONZE: { referral: 5, tier_bonus: 2 },
                SILVER: { referral: 7, tier_bonus: 3 },
                GOLD: { referral: 10, tier_bonus: 5 },
                PREMIUM: { referral: 12, tier_bonus: 6 },
                PLATINUM: { referral: 15, tier_bonus: 7 },
                DIAMOND: { referral: 20, tier_bonus: 10 }
            };

            const userTier = user?.tier || 'BRONZE';
            const rates = referralRates[userTier] || referralRates.BRONZE;

            const data = {
                current_tier: userTier,
                referral_rate: rates.referral,
                tier_bonus_rate: rates.tier_bonus,
                program_details: {
                    description: 'Earn commissions when people you refer sign up and make purchases',
                    requirements: 'Referrals must complete at least one purchase to qualify',
                    payment_terms: 'Commissions are paid monthly, 30 days after the referral purchase'
                }
            };

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get referral program error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch referral program details'
            });
        }
    }
}
