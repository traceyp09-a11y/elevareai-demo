import Database from 'better-sqlite3';

export interface KPIResult {
  value: number;
  displayValue: string;
  calculation: {
    formula: string;
    components: { [key: string]: any };
    steps: string[];
  };
  trend?: {
    previous: number;
    change: number;
    changePercent: number;
  };
  benchmark?: {
    value: number;
    status: 'above' | 'at' | 'below';
  };
}

export class KPICalculationService {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  // 1. Employee Turnover Rate
  calculateTurnoverRate(startDate: string, endDate: string): KPIResult {
    // Get beginning and ending headcount
    const beginCount = this.db.prepare(`
      SELECT COUNT(*) as count FROM employees
      WHERE status = 'Active' AND hire_date <= ?
    `).get(startDate) as any;

    const endCount = this.db.prepare(`
      SELECT COUNT(*) as count FROM employees
      WHERE status = 'Active'
    `).get() as any;

    // Get separations in period
    const separations = this.db.prepare(`
      SELECT COUNT(*) as count FROM separations
      WHERE separation_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const avgEmployees = (beginCount.count + endCount.count) / 2;
    const turnoverRate = (separations.count / avgEmployees) * 100;

    // Calculate cost impact
    const separationDetails = this.db.prepare(`
      SELECT s.*, e.base_salary, e.hourly_rate, e.job_level
      FROM separations s
      JOIN employees e ON s.employee_id = e.id
      WHERE s.separation_date BETWEEN ? AND ?
    `).all(startDate, endDate);

    let totalCost = 0;
    (separationDetails as any[]).forEach(sep => {
      const annualSalary = sep.base_salary || (sep.hourly_rate * 2080);
      let costMultiplier = 0.5; // Entry level default

      if (sep.job_level === 'Mid') costMultiplier = 1.25;
      else if (sep.job_level === 'Senior' || sep.job_level === 'Manager') costMultiplier = 2.0;
      else if (sep.job_level === 'Director' || sep.job_level === 'VP') costMultiplier = 2.5;

      totalCost += annualSalary * costMultiplier;
    });

    return {
      value: turnoverRate,
      displayValue: `${turnoverRate.toFixed(2)}%`,
      calculation: {
        formula: 'Turnover Rate = (Number of Separations / Average Number of Employees) × 100',
        components: {
          beginningHeadcount: beginCount.count,
          endingHeadcount: endCount.count,
          averageEmployees: avgEmployees,
          separations: separations.count,
          period: `${startDate} to ${endDate}`,
          turnoverCost: totalCost
        },
        steps: [
          `Step 1: Calculate average employees = (${beginCount.count} + ${endCount.count}) / 2 = ${avgEmployees.toFixed(2)}`,
          `Step 2: Count separations in period = ${separations.count}`,
          `Step 3: Calculate turnover rate = (${separations.count} / ${avgEmployees.toFixed(2)}) × 100 = ${turnoverRate.toFixed(2)}%`,
          `Step 4: Calculate cost impact = $${totalCost.toLocaleString()}`
        ]
      },
      benchmark: {
        value: 20,
        status: turnoverRate < 20 ? 'below' : turnoverRate > 20 ? 'above' : 'at'
      }
    };
  }

  // 2. Time to Hire
  calculateTimeToHire(startDate: string, endDate: string): KPIResult {
    const hires = this.db.prepare(`
      SELECT
        jp.posted_date,
        c.offer_date,
        julianday(c.offer_date) - julianday(jp.posted_date) as days_to_hire,
        jp.title,
        jp.job_level
      FROM candidates c
      JOIN job_postings jp ON c.job_posting_id = jp.id
      WHERE c.offer_accepted = 1
        AND c.offer_date BETWEEN ? AND ?
    `).all(startDate, endDate);

    if ((hires as any[]).length === 0) {
      return this.createEmptyResult('Time to Hire', 'No hires in period');
    }

    const totalDays = (hires as any[]).reduce((sum, h) => sum + h.days_to_hire, 0);
    const avgDays = totalDays / (hires as any[]).length;

    // Breakdown by level
    const byLevel: { [key: string]: number[] } = {};
    (hires as any[]).forEach(h => {
      if (!byLevel[h.job_level]) byLevel[h.job_level] = [];
      byLevel[h.job_level].push(h.days_to_hire);
    });

    const levelBreakdown: { [key: string]: number } = {};
    Object.keys(byLevel).forEach(level => {
      const avg = byLevel[level].reduce((a, b) => a + b, 0) / byLevel[level].length;
      levelBreakdown[level] = parseFloat(avg.toFixed(1));
    });

    return {
      value: avgDays,
      displayValue: `${avgDays.toFixed(1)} days`,
      calculation: {
        formula: 'Time to Hire = Σ(Offer Acceptance Date - Job Posting Date) / Number of Hires',
        components: {
          totalHires: (hires as any[]).length,
          totalDays: totalDays,
          averageDays: avgDays,
          byLevel: levelBreakdown,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Identify all accepted offers in period = ${(hires as any[]).length} hires`,
          `Step 2: Calculate days from posting to offer for each hire`,
          `Step 3: Sum all days = ${totalDays.toFixed(1)} days`,
          `Step 4: Calculate average = ${totalDays.toFixed(1)} / ${(hires as any[]).length} = ${avgDays.toFixed(1)} days`
        ]
      },
      benchmark: {
        value: 42,
        status: avgDays < 42 ? 'below' : avgDays > 42 ? 'above' : 'at'
      }
    };
  }

  // 3. Cost per Hire
  calculateCostPerHire(startDate: string, endDate: string): KPIResult {
    const financials = this.db.prepare(`
      SELECT recruitment_costs FROM financial_data
      WHERE period_start >= ? AND period_end <= ?
    `).all(startDate, endDate);

    const totalRecruitmentCosts = (financials as any[]).reduce((sum, f) => sum + f.recruitment_costs, 0);

    const numHires = this.db.prepare(`
      SELECT COUNT(*) as count FROM candidates
      WHERE offer_accepted = 1 AND offer_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    if (numHires.count === 0) {
      return this.createEmptyResult('Cost per Hire', 'No hires in period');
    }

    const costPerHire = totalRecruitmentCosts / numHires.count;

    // Breakdown of costs
    const internalCosts = totalRecruitmentCosts * 0.58; // Recruiter salaries, HR time, etc.
    const externalCosts = totalRecruitmentCosts * 0.42; // Job boards, agencies, etc.

    return {
      value: costPerHire,
      displayValue: `$${costPerHire.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      calculation: {
        formula: 'Cost per Hire = (Total Internal Costs + Total External Costs) / Number of Hires',
        components: {
          totalRecruitmentCosts: totalRecruitmentCosts,
          internalCosts: internalCosts,
          externalCosts: externalCosts,
          numberOfHires: numHires.count,
          costPerHire: costPerHire,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Sum total recruitment costs = $${totalRecruitmentCosts.toLocaleString()}`,
          `Step 2: Internal costs (58%) = $${internalCosts.toLocaleString()}`,
          `Step 3: External costs (42%) = $${externalCosts.toLocaleString()}`,
          `Step 4: Total hires in period = ${numHires.count}`,
          `Step 5: Cost per hire = $${totalRecruitmentCosts.toLocaleString()} / ${numHires.count} = $${costPerHire.toLocaleString()}`
        ]
      },
      benchmark: {
        value: 4500,
        status: costPerHire < 4500 ? 'below' : costPerHire > 4500 ? 'above' : 'at'
      }
    };
  }

  // 4. Employee Productivity (Revenue per Employee)
  calculateProductivity(startDate: string, endDate: string): KPIResult {
    const financial = this.db.prepare(`
      SELECT SUM(total_revenue) as revenue FROM financial_data
      WHERE period_start >= ? AND period_end <= ?
    `).get(startDate, endDate) as any;

    const avgEmployees = this.db.prepare(`
      SELECT COUNT(*) as count FROM employees WHERE status = 'Active'
    `).get() as any;

    const revenuePerEmployee = financial.revenue / avgEmployees.count;

    // Also calculate operating income per employee
    const operatingIncome = this.db.prepare(`
      SELECT SUM(operating_income) as income FROM financial_data
      WHERE period_start >= ? AND period_end <= ?
    `).get(startDate, endDate) as any;

    const incomePerEmployee = operatingIncome.income / avgEmployees.count;

    return {
      value: revenuePerEmployee,
      displayValue: `$${revenuePerEmployee.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      calculation: {
        formula: 'Revenue per Employee = Total Revenue / Average Number of Employees',
        components: {
          totalRevenue: financial.revenue,
          averageEmployees: avgEmployees.count,
          revenuePerEmployee: revenuePerEmployee,
          operatingIncome: operatingIncome.income,
          incomePerEmployee: incomePerEmployee,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Sum total revenue for period = $${financial.revenue.toLocaleString()}`,
          `Step 2: Calculate average employees = ${avgEmployees.count}`,
          `Step 3: Revenue per employee = $${financial.revenue.toLocaleString()} / ${avgEmployees.count} = $${revenuePerEmployee.toLocaleString()}`,
          `Step 4: Operating income per employee = $${operatingIncome.income.toLocaleString()} / ${avgEmployees.count} = $${incomePerEmployee.toLocaleString()}`
        ]
      },
      benchmark: {
        value: 103000,
        status: revenuePerEmployee > 103000 ? 'above' : revenuePerEmployee < 103000 ? 'below' : 'at'
      }
    };
  }

  // 5. Safety Incident Rate (TRIR)
  calculateTRIR(startDate: string, endDate: string): KPIResult {
    const incidents = this.db.prepare(`
      SELECT COUNT(*) as count FROM safety_incidents
      WHERE recordable = 1 AND incident_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const laborHours = this.db.prepare(`
      SELECT SUM(total_hours) as hours FROM labor_hours
      WHERE record_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const trir = (incidents.count * 200000) / laborHours.hours;

    // Breakdown by type
    const byType = this.db.prepare(`
      SELECT incident_type, COUNT(*) as count
      FROM safety_incidents
      WHERE incident_date BETWEEN ? AND ?
      GROUP BY incident_type
    `).all(startDate, endDate);

    const typeBreakdown: { [key: string]: number } = {};
    (byType as any[]).forEach(t => {
      typeBreakdown[t.incident_type] = t.count;
    });

    // Cost impact
    const costs = this.db.prepare(`
      SELECT
        SUM(direct_cost) as direct,
        SUM(estimated_indirect_cost) as indirect
      FROM safety_incidents
      WHERE incident_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const totalSafetyCost = costs.direct + costs.indirect;

    return {
      value: trir,
      displayValue: trir.toFixed(2),
      calculation: {
        formula: 'TRIR = (Number of Recordable Incidents × 200,000) / Total Hours Worked',
        components: {
          recordableIncidents: incidents.count,
          totalHours: laborHours.hours,
          trir: trir,
          byType: typeBreakdown,
          directCosts: costs.direct,
          indirectCosts: costs.indirect,
          totalCost: totalSafetyCost,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Count recordable incidents = ${incidents.count}`,
          `Step 2: Sum total labor hours = ${laborHours.hours.toLocaleString()}`,
          `Step 3: Calculate TRIR = (${incidents.count} × 200,000) / ${laborHours.hours.toLocaleString()} = ${trir.toFixed(2)}`,
          `Step 4: Direct costs = $${costs.direct.toLocaleString()}`,
          `Step 5: Indirect costs (estimated) = $${costs.indirect.toLocaleString()}`,
          `Step 6: Total safety cost = $${totalSafetyCost.toLocaleString()}`
        ]
      },
      benchmark: {
        value: 4.2,
        status: trir < 4.2 ? 'below' : trir > 4.2 ? 'above' : 'at'
      }
    };
  }

  // 6. Absenteeism Rate
  calculateAbsenteeismRate(startDate: string, endDate: string): KPIResult {
    const absences = this.db.prepare(`
      SELECT SUM(hours_missed) / 8.0 as days FROM absences
      WHERE absence_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const avgEmployees = this.db.prepare(`
      SELECT COUNT(*) as count FROM employees WHERE status = 'Active'
    `).get() as any;

    // Calculate work days in period (approximate)
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    const workDays = Math.floor(daysDiff * (5/7)); // Approximate work days

    const totalAvailableDays = avgEmployees.count * workDays;
    const absenteeismRate = (absences.days / totalAvailableDays) * 100;

    // Breakdown by type
    const byType = this.db.prepare(`
      SELECT absence_type, COUNT(*) as count, SUM(hours_missed) / 8.0 as days
      FROM absences
      WHERE absence_date BETWEEN ? AND ?
      GROUP BY absence_type
    `).all(startDate, endDate);

    const typeBreakdown: { [key: string]: any } = {};
    (byType as any[]).forEach(t => {
      typeBreakdown[t.absence_type] = {
        count: t.count,
        days: parseFloat(t.days.toFixed(1)),
        percentage: ((t.days / absences.days) * 100).toFixed(1)
      };
    });

    // Cost calculation
    const avgDailyWage = 185; // Estimate based on workforce mix
    const directCost = absences.days * avgDailyWage;
    const productivityLoss = directCost * 0.20;
    const overtimePremium = directCost * 0.30;
    const totalCost = directCost + productivityLoss + overtimePremium;

    return {
      value: absenteeismRate,
      displayValue: `${absenteeismRate.toFixed(2)}%`,
      calculation: {
        formula: 'Absenteeism Rate = (Total Absent Days / Total Available Work Days) × 100',
        components: {
          totalEmployees: avgEmployees.count,
          workDaysInPeriod: workDays,
          totalAvailableDays: totalAvailableDays,
          absentDays: parseFloat(absences.days.toFixed(1)),
          absenteeismRate: absenteeismRate,
          byType: typeBreakdown,
          costImpact: {
            directCost: directCost,
            productivityLoss: productivityLoss,
            overtimePremium: overtimePremium,
            totalCost: totalCost
          },
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Calculate work days in period = ${workDays} days`,
          `Step 2: Total available work days = ${avgEmployees.count} employees × ${workDays} days = ${totalAvailableDays.toLocaleString()} days`,
          `Step 3: Sum absent days = ${absences.days.toFixed(1)} days`,
          `Step 4: Absenteeism rate = (${absences.days.toFixed(1)} / ${totalAvailableDays.toLocaleString()}) × 100 = ${absenteeismRate.toFixed(2)}%`,
          `Step 5: Calculate cost impact = $${totalCost.toLocaleString()}`
        ]
      },
      benchmark: {
        value: 3.5,
        status: absenteeismRate < 3.5 ? 'below' : absenteeismRate > 3.5 ? 'above' : 'at'
      }
    };
  }

  // 7. Training ROI
  calculateTrainingROI(fiscalYear: number): KPIResult {
    const trainingCosts = this.db.prepare(`
      SELECT SUM(training_costs) as costs FROM financial_data
      WHERE fiscal_period LIKE ?
    `).get(`${fiscalYear}%`) as any;

    // Calculate benefits (estimated based on improvements)
    const completedTraining = this.db.prepare(`
      SELECT COUNT(*) as count,
             AVG(post_assessment_score - pre_assessment_score) as improvement
      FROM training_enrollments
      WHERE status = 'Completed'
        AND strftime('%Y', completion_date) = ?
    `).get(fiscalYear.toString()) as any;

    // Estimate productivity gain (conservative estimate: 15% improvement = $2200 per employee annually)
    const productivityGain = completedTraining.count * 2200;

    // Estimate reduced turnover (trained employees 30% less likely to leave)
    const avgTurnoverCost = 65000; // Average cost of turnover
    const reducedTurnover = completedTraining.count * 0.10 * avgTurnoverCost;

    // Estimate improved safety
    const improvedSafety = completedTraining.count * 0.08 * 5000; // Avg incident cost

    // Estimate reduced errors
    const reducedErrors = completedTraining.count * 500;

    const totalBenefits = productivityGain + reducedTurnover + improvedSafety + reducedErrors;
    const roi = ((totalBenefits - trainingCosts.costs) / trainingCosts.costs) * 100;

    return {
      value: roi,
      displayValue: `${roi.toFixed(1)}%`,
      calculation: {
        formula: 'Training ROI = [(Training Benefits - Training Costs) / Training Costs] × 100',
        components: {
          totalInvestment: trainingCosts.costs,
          employeesTrained: completedTraining.count,
          avgImprovement: parseFloat(completedTraining.improvement?.toFixed(1) || '0'),
          benefits: {
            productivityGain: productivityGain,
            reducedTurnover: reducedTurnover,
            improvedSafety: improvedSafety,
            reducedErrors: reducedErrors,
            totalBenefits: totalBenefits
          },
          roi: roi,
          fiscalYear: fiscalYear
        },
        steps: [
          `Step 1: Total training costs = $${trainingCosts.costs.toLocaleString()}`,
          `Step 2: Employees completing training = ${completedTraining.count}`,
          `Step 3: Calculate benefits:`,
          `   - Productivity gain = ${completedTraining.count} × $2,200 = $${productivityGain.toLocaleString()}`,
          `   - Reduced turnover = ${completedTraining.count} × 10% × $65,000 = $${reducedTurnover.toLocaleString()}`,
          `   - Improved safety = $${improvedSafety.toLocaleString()}`,
          `   - Reduced errors = $${reducedErrors.toLocaleString()}`,
          `Step 4: Total benefits = $${totalBenefits.toLocaleString()}`,
          `Step 5: ROI = [($${totalBenefits.toLocaleString()} - $${trainingCosts.costs.toLocaleString()}) / $${trainingCosts.costs.toLocaleString()}] × 100 = ${roi.toFixed(1)}%`
        ]
      },
      benchmark: {
        value: 150,
        status: roi > 150 ? 'above' : roi < 150 ? 'below' : 'at'
      }
    };
  }

  // 8. Employee Engagement Score
  calculateEngagementScore(surveyId?: number): KPIResult {
    // Get most recent survey if not specified
    let survey: any;
    if (surveyId) {
      survey = this.db.prepare(`
        SELECT * FROM engagement_surveys WHERE id = ?
      `).get(surveyId);
    } else {
      survey = this.db.prepare(`
        SELECT * FROM engagement_surveys ORDER BY survey_date DESC LIMIT 1
      `).get();
    }

    if (!survey) {
      return this.createEmptyResult('Engagement Score', 'No surveys found');
    }

    const responses = this.db.prepare(`
      SELECT
        AVG(job_satisfaction_score) as job_sat,
        AVG(manager_effectiveness_score) as mgr_eff,
        AVG(career_growth_score) as career,
        AVG(company_culture_score) as culture,
        AVG(work_life_balance_score) as work_life,
        AVG(total_score) as total
      FROM survey_responses
      WHERE survey_id = ?
    `).get(survey.id) as any;

    // Convert to percentage (out of 100)
    const maxScore = 100; // 20 questions × 5 points
    const engagementScore = (responses.total / maxScore) * 100;

    // Category scores
    const categoryScores = {
      jobSatisfaction: ((responses.job_sat / 25) * 100).toFixed(1),
      managerEffectiveness: ((responses.mgr_eff / 20) * 100).toFixed(1),
      careerGrowth: ((responses.career / 15) * 100).toFixed(1),
      companyCulture: ((responses.culture / 20) * 100).toFixed(1),
      workLifeBalance: ((responses.work_life / 20) * 100).toFixed(1)
    };

    const responseRate = (survey.responses_received / survey.total_employees) * 100;

    return {
      value: engagementScore,
      displayValue: `${engagementScore.toFixed(1)}%`,
      calculation: {
        formula: 'Engagement Score = (Σ Survey Responses / Maximum Possible Score) × 100',
        components: {
          surveyName: survey.survey_name,
          surveyDate: survey.survey_date,
          totalEmployees: survey.total_employees,
          responsesReceived: survey.responses_received,
          responseRate: responseRate.toFixed(1),
          averageTotalScore: responses.total.toFixed(1),
          maximumScore: maxScore,
          engagementScore: engagementScore,
          categoryBreakdown: categoryScores
        },
        steps: [
          `Step 1: Survey "${survey.survey_name}" on ${survey.survey_date}`,
          `Step 2: Responses received = ${survey.responses_received} / ${survey.total_employees} (${responseRate.toFixed(1)}%)`,
          `Step 3: Average total score = ${responses.total.toFixed(1)} out of ${maxScore}`,
          `Step 4: Engagement score = (${responses.total.toFixed(1)} / ${maxScore}) × 100 = ${engagementScore.toFixed(1)}%`,
          `Step 5: Category breakdown:`,
          `   - Job Satisfaction: ${categoryScores.jobSatisfaction}%`,
          `   - Manager Effectiveness: ${categoryScores.managerEffectiveness}%`,
          `   - Career Growth: ${categoryScores.careerGrowth}%`,
          `   - Company Culture: ${categoryScores.companyCulture}%`,
          `   - Work-Life Balance: ${categoryScores.workLifeBalance}%`
        ]
      },
      benchmark: {
        value: 75,
        status: engagementScore > 75 ? 'above' : engagementScore < 75 ? 'below' : 'at'
      }
    };
  }

  // 9. Offer Acceptance Rate
  calculateOfferAcceptanceRate(startDate: string, endDate: string): KPIResult {
    const offers = this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN offer_accepted = 1 THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN offer_accepted = 0 THEN 1 ELSE 0 END) as declined
      FROM candidates
      WHERE offer_date IS NOT NULL
        AND offer_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    if (offers.total === 0) {
      return this.createEmptyResult('Offer Acceptance Rate', 'No offers in period');
    }

    const acceptanceRate = (offers.accepted / offers.total) * 100;

    // Decline reasons
    const declineReasons = this.db.prepare(`
      SELECT offer_declined_reason, COUNT(*) as count
      FROM candidates
      WHERE offer_accepted = 0
        AND offer_date BETWEEN ? AND ?
      GROUP BY offer_declined_reason
    `).all(startDate, endDate);

    const reasonBreakdown: { [key: string]: any } = {};
    (declineReasons as any[]).forEach(r => {
      reasonBreakdown[r.offer_declined_reason] = {
        count: r.count,
        percentage: ((r.count / offers.declined) * 100).toFixed(1)
      };
    });

    // Cost impact
    const costPerDecline = 4740;
    const totalDeclineCost = offers.declined * costPerDecline;

    return {
      value: acceptanceRate,
      displayValue: `${acceptanceRate.toFixed(1)}%`,
      calculation: {
        formula: 'Offer Acceptance Rate = (Number of Accepted Offers / Total Offers Extended) × 100',
        components: {
          totalOffers: offers.total,
          acceptedOffers: offers.accepted,
          declinedOffers: offers.declined,
          acceptanceRate: acceptanceRate,
          declineReasons: reasonBreakdown,
          costPerDecline: costPerDecline,
          totalCost: totalDeclineCost,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total offers extended = ${offers.total}`,
          `Step 2: Offers accepted = ${offers.accepted}`,
          `Step 3: Offers declined = ${offers.declined}`,
          `Step 4: Acceptance rate = (${offers.accepted} / ${offers.total}) × 100 = ${acceptanceRate.toFixed(1)}%`,
          `Step 5: Cost of declines = ${offers.declined} × $${costPerDecline.toLocaleString()} = $${totalDeclineCost.toLocaleString()}`
        ]
      },
      benchmark: {
        value: 82,
        status: acceptanceRate > 82 ? 'above' : acceptanceRate < 82 ? 'below' : 'at'
      }
    };
  }

  // 10. Revenue per Employee (duplicate of productivity but standalone)
  calculateRevenuePerEmployee(startDate: string, endDate: string): KPIResult {
    return this.calculateProductivity(startDate, endDate);
  }

  // Helper method for empty results
  private createEmptyResult(kpiName: string, reason: string): KPIResult {
    return {
      value: 0,
      displayValue: 'N/A',
      calculation: {
        formula: reason,
        components: {},
        steps: []
      }
    };
  }

  // Get all KPIs for a period
  getAllKPIs(startDate: string, endDate: string) {
    return {
      turnoverRate: this.calculateTurnoverRate(startDate, endDate),
      timeToHire: this.calculateTimeToHire(startDate, endDate),
      costPerHire: this.calculateCostPerHire(startDate, endDate),
      productivity: this.calculateProductivity(startDate, endDate),
      trir: this.calculateTRIR(startDate, endDate),
      absenteeism: this.calculateAbsenteeismRate(startDate, endDate),
      trainingROI: this.calculateTrainingROI(2024),
      engagement: this.calculateEngagementScore(),
      offerAcceptance: this.calculateOfferAcceptanceRate(startDate, endDate),
      revenuePerEmployee: this.calculateRevenuePerEmployee(startDate, endDate)
    };
  }

  close() {
    this.db.close();
  }
}
