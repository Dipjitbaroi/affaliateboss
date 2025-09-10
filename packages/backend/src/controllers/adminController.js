// Admin Controller
// Contains business logic for admin operations

import { getDatabase } from '../../lib/prisma.js';

export class AdminController {
  static async getOverview(req, res) {
    try {
      // Get admin key from headers or query
      const adminKey = req.headers['x-admin-key'] || req.query.admin_key;

      if (!adminKey) {
        return res.status(401).json({
          success: false,
          message: 'Admin key required',
          error: 'ADMIN_KEY_REQUIRED'
        });
      }

      // Authenticate admin (simplified for demo)
      if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'demo_admin_key') {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin key',
          error: 'INVALID_ADMIN_KEY'
        });
      }

      const db = getDatabase();

      // Get affiliate counts by status
      const affiliateStats = await db.user.groupBy({
        by: ['status'],
        _count: {
          id: true
        },
        where: {
          id: {
            gt: 1 // Exclude admin user
          }
        }
      });

      const affiliateStatsFormatted = {
        total_affiliates: affiliateStats.reduce((sum, stat) => sum + stat._count.id, 0),
        active_affiliates: affiliateStats.find(stat => stat.status === 'ACTIVE')?._count.id || 0,
        pending_affiliates: affiliateStats.find(stat => stat.status === 'PENDING')?._count.id || 0,
        suspended_affiliates: affiliateStats.find(stat => stat.status === 'SUSPENDED')?._count.id || 0,
        inactive_affiliates: affiliateStats.find(stat => stat.status === 'INACTIVE')?._count.id || 0
      };

      // Get sales from affiliates this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const salesStats = await db.commission.aggregate({
        where: {
          saleDate: {
            gte: startOfMonth
          },
          status: {
            in: ['CONFIRMED', 'PAID']
          }
        },
        _sum: {
          saleAmount: true,
          commissionAmount: true
        },
        _count: {
          id: true
        },
        _avg: {
          commissionRate: true
        }
      });

      // Get tier distribution
      const tierStats = await db.user.groupBy({
        by: ['tier'],
        where: {
          id: {
            gt: 1
          }
        },
        _count: {
          id: true
        },
        _sum: {
          totalEarnings: true
        },
        _avg: {
          totalEarnings: true
        }
      });

      const tierOrder = ['BRONZE', 'SILVER', 'GOLD', 'PREMIUM', 'PLATINUM', 'DIAMOND'];
      const tierStatsFormatted = tierStats
        .sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier))
        .map(tier => ({
          tier: tier.tier,
          count: tier._count.id,
          avg_earnings: tier._avg.totalEarnings || 0,
          total_earnings: tier._sum.totalEarnings || 0
        }));

      // Get recent activity
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentActivity = await db.commission.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        },
        include: {
          user: {
            select: {
              username: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 15
      });

      // Get top performing affiliates
      const topAffiliates = await db.user.findMany({
        where: {
          id: {
            gt: 1
          },
          status: 'ACTIVE'
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          tier: true,
          totalEarnings: true,
          _count: {
            select: {
              affiliateLinks: true
            }
          }
        },
        orderBy: {
          totalEarnings: 'desc'
        },
        take: 10
      });

      // Get commission trends (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const commissionTrends = await db.commission.groupBy({
        by: ['saleDate'],
        where: {
          saleDate: {
            gte: thirtyDaysAgo
          },
          status: {
            in: ['CONFIRMED', 'PAID']
          }
        },
        _count: {
          id: true
        },
        _sum: {
          saleAmount: true,
          commissionAmount: true
        },
        orderBy: {
          saleDate: 'desc'
        }
      });

      // Calculate growth metrics
      const lastMonthStart = new Date();
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1, 1);
      const lastMonthEnd = new Date();
      lastMonthEnd.setDate(0); // Last day of previous month

      const lastMonthStats = await db.commission.aggregate({
        where: {
          saleDate: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          },
          status: {
            in: ['CONFIRMED', 'PAID']
          }
        },
        _sum: {
          saleAmount: true,
          commissionAmount: true
        },
        _count: {
          id: true
        }
      });

      // Calculate growth percentages
      const currentSales = salesStats._sum.saleAmount || 0;
      const lastMonthSales = lastMonthStats._sum.saleAmount || 0;
      const salesGrowth = lastMonthSales > 0
        ? ((currentSales - lastMonthSales) / lastMonthSales * 100).toFixed(1)
        : currentSales > 0 ? '100.0' : '0.0';

      const currentCommissions = salesStats._sum.commissionAmount || 0;
      const lastMonthCommissions = lastMonthStats._sum.commissionAmount || 0;
      const commissionGrowth = lastMonthCommissions > 0
        ? ((currentCommissions - lastMonthCommissions) / lastMonthCommissions * 100).toFixed(1)
        : currentCommissions > 0 ? '100.0' : '0.0';

      const responseData = {
        affiliate_stats: {
          ...affiliateStatsFormatted,
          growth_rate: '15.2' // Mock growth rate - calculate from historical data in production
        },
        sales_stats: {
          total_affiliate_sales: parseFloat(currentSales).toFixed(2),
          total_commissions_paid: parseFloat(currentCommissions).toFixed(2),
          total_orders: salesStats._count.id,
          avg_commission_rate: parseFloat(salesStats._avg.commissionRate || 0).toFixed(2),
          sales_growth: salesGrowth,
          commission_growth: commissionGrowth
        },
        tier_distribution: tierStatsFormatted.map(tier => ({
          ...tier,
          avg_earnings: parseFloat(tier.avg_earnings).toFixed(2),
          total_earnings: parseFloat(tier.total_earnings).toFixed(2)
        })),
        recent_activity: recentActivity.map(activity => ({
          username: activity.user.username,
          email: activity.user.email,
          first_name: activity.user.firstName,
          last_name: activity.user.lastName,
          commission_amount: parseFloat(activity.commissionAmount).toFixed(2),
          sale_amount: parseFloat(activity.saleAmount).toFixed(2),
          sale_date: activity.saleDate.toISOString(),
          status: activity.status.toLowerCase(),
          activity_type: 'commission'
        })),
        top_affiliates: topAffiliates.map(affiliate => ({
          id: affiliate.id,
          username: affiliate.username,
          first_name: affiliate.firstName,
          last_name: affiliate.lastName,
          email: affiliate.email,
          tier: affiliate.tier,
          total_earnings: parseFloat(affiliate.totalEarnings).toFixed(2),
          total_links: affiliate._count.affiliateLinks,
          total_clicks: 0, // Would need to aggregate from links
          total_conversions: 0, // Would need to aggregate from links
          conversion_rate: '0.00' // Would need to calculate
        })),
        commission_trends: commissionTrends.map(trend => ({
          date: trend.saleDate.toISOString().split('T')[0],
          orders: trend._count.id,
          sales: parseFloat(trend._sum.saleAmount || 0).toFixed(2),
          commissions: parseFloat(trend._sum.commissionAmount || 0).toFixed(2)
        })),
        pending_applications: 0, // Would need affiliate applications table
        store_info: {
          name: 'Demo Fashion Store',
          plan: 'Shopify Plus',
          currency: 'USD',
          total_products: 1250,
          active_affiliates: affiliateStatsFormatted.active_affiliates
        }
      };

      return res.status(200).json({
        success: true,
        message: 'Admin overview retrieved successfully',
        data: responseData
      });

    } catch (error) {
      console.error('Admin overview error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get admin overview',
        error: error.message
      });
    }
  }

  static async getAffiliates(req, res) {
    try {
      const adminKey = req.headers['x-admin-key'] || req.query.admin_key;
      if (!adminKey || (adminKey !== process.env.ADMIN_KEY && adminKey !== 'demo_admin_key')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin key',
          error: 'INVALID_ADMIN_KEY'
        });
      }

      const { page = 1, limit = 20, status, tier, search } = req.query;
      const skip = (page - 1) * limit;

      const db = getDatabase();

      const where = {
        id: {
          gt: 1 // Exclude admin user
        }
      };

      if (status) {
        where.status = status.toUpperCase();
      }

      if (tier) {
        where.tier = tier.toUpperCase();
      }

      if (search) {
        where.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count
      const totalCount = await db.user.count({ where });

      // Get affiliates with pagination
      const affiliates = await db.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          tier: true,
          status: true,
          totalEarnings: true,
          createdAt: true,
          lastLogin: true,
          _count: {
            select: {
              affiliateLinks: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      });

      const responseData = {
        affiliates: affiliates.map(affiliate => ({
          id: affiliate.id,
          username: affiliate.username,
          email: affiliate.email,
          first_name: affiliate.firstName,
          last_name: affiliate.lastName,
          tier: affiliate.tier,
          status: affiliate.status,
          total_earnings: parseFloat(affiliate.totalEarnings).toFixed(2),
          total_links: affiliate._count.affiliateLinks,
          total_clicks: 0, // Would need aggregation
          total_conversions: 0, // Would need aggregation
          created_at: affiliate.createdAt.toISOString(),
          last_login: affiliate.lastLogin?.toISOString(),
          conversion_rate: '0.00' // Would need calculation
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };

      return res.status(200).json({
        success: true,
        message: 'Affiliates retrieved successfully',
        data: responseData
      });

    } catch (error) {
      console.error('Get affiliates error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get affiliates',
        error: error.message
      });
    }
  }

  static async updateAffiliateStatus(req, res) {
    try {
      const adminKey = req.headers['x-admin-key'] || req.query.admin_key;
      if (!adminKey || (adminKey !== process.env.ADMIN_KEY && adminKey !== 'demo_admin_key')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin key',
          error: 'INVALID_ADMIN_KEY'
        });
      }

      const { userId } = req.params;
      const { status } = req.body;

      if (!userId || !status) {
        return res.status(400).json({
          success: false,
          message: 'User ID and status are required',
          error: 'MISSING_REQUIRED_FIELDS'
        });
      }

      const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
          error: 'INVALID_STATUS'
        });
      }

      const db = getDatabase();

      // Update user status
      const updatedUser = await db.user.update({
        where: { id: parseInt(userId) },
        data: {
          status: status.toUpperCase(),
          updatedAt: new Date()
        }
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Affiliate status updated successfully'
      });

    } catch (error) {
      console.error('Update affiliate status error:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to update affiliate status',
        error: error.message
      });
    }
  }

  // Placeholder methods for applications and payouts - would need additional tables/models
  static async getApplications(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Applications feature not implemented yet',
      data: { applications: [], pagination: { total: 0 } }
    });
  }

  static async processApplication(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Application processing not implemented yet'
    });
  }

  static async getPayouts(req, res) {
    try {
      const adminKey = req.headers['x-admin-key'] || req.query.admin_key;
      if (!adminKey || (adminKey !== process.env.ADMIN_KEY && adminKey !== 'demo_admin_key')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin key',
          error: 'INVALID_ADMIN_KEY'
        });
      }

      const db = getDatabase();

      const payouts = await db.payout.findMany({
        include: {
          user: {
            select: {
              username: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const totals = await db.payout.aggregate({
        _count: {
          id: true
        },
        _sum: {
          amount: true
        },
        where: {
          status: 'COMPLETED'
        }
      });

      const pendingTotals = await db.payout.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'REQUESTED'
        }
      });

      const processingTotals = await db.payout.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'PROCESSING'
        }
      });

      const responseData = {
        payouts: payouts.map(payout => ({
          id: payout.id,
          user_id: payout.userId,
          username: payout.user.username,
          email: payout.user.email,
          first_name: payout.user.firstName,
          last_name: payout.user.lastName,
          amount: parseFloat(payout.amount).toFixed(2),
          net_amount: parseFloat(payout.netAmount).toFixed(2),
          status: payout.status,
          requested_date: payout.requestedDate.toISOString(),
          processed_date: payout.processedDate?.toISOString(),
          completed_date: payout.completedDate?.toISOString()
        })),
        totals: {
          total_payouts: totals._count.id,
          total_paid: parseFloat(totals._sum.amount || 0).toFixed(2),
          total_pending: parseFloat(pendingTotals._sum.amount || 0).toFixed(2),
          total_processing: parseFloat(processingTotals._sum.amount || 0).toFixed(2)
        }
      };

      return res.status(200).json({
        success: true,
        message: 'Payouts retrieved successfully',
        data: responseData
      });

    } catch (error) {
      console.error('Get payouts error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get payouts',
        error: error.message
      });
    }
  }

  static async processPayout(req, res) {
    try {
      const adminKey = req.headers['x-admin-key'] || req.query.admin_key;
      if (!adminKey || (adminKey !== process.env.ADMIN_KEY && adminKey !== 'demo_admin_key')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin key',
          error: 'INVALID_ADMIN_KEY'
        });
      }

      const { payoutId } = req.params;
      const { action, notes } = req.body;

      if (!payoutId || !action) {
        return res.status(400).json({
          success: false,
          message: 'Payout ID and action are required',
          error: 'MISSING_REQUIRED_FIELDS'
        });
      }

      if (!['complete', 'cancel', 'process'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action',
          error: 'INVALID_ACTION'
        });
      }

      const db = getDatabase();

      let updateData = {
        updatedAt: new Date()
      };

      switch (action) {
        case 'complete':
          updateData.status = 'COMPLETED';
          updateData.completedDate = new Date();
          break;
        case 'cancel':
          updateData.status = 'CANCELLED';
          break;
        case 'process':
          updateData.status = 'PROCESSING';
          updateData.processedDate = new Date();
          break;
      }

      if (notes) {
        updateData.notes = notes;
      }

      const updatedPayout = await db.payout.update({
        where: { id: payoutId },
        data: updateData
      });

      if (!updatedPayout) {
        return res.status(404).json({
          success: false,
          message: 'Payout not found',
          error: 'PAYOUT_NOT_FOUND'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Payout ${action}d successfully`
      });

    } catch (error) {
      console.error('Process payout error:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Payout not found',
          error: 'PAYOUT_NOT_FOUND'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to process payout',
        error: error.message
      });
    }
  }
}
