export interface RiskAlert {
    id: string;
    timestamp: Date;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: string;
    message: string;
    recommendation: string;
}

export interface AlertThresholds {
    highRiskScore: number; // Alert when portfolio risk > this (e.g., 50)
    criticalRiskScore: number; // Critical alert (e.g., 70)
    concentrationLimit: number; // Alert when single protocol > this % (e.g., 60)
    protocolRiskChange: number; // Alert when protocol risk changes by > this (e.g., 10)
}

export class RiskAlertSystem {
    private thresholds: AlertThresholds;
    private alerts: RiskAlert[] = [];

    constructor(thresholds?: Partial<AlertThresholds>) {
        this.thresholds = {
            highRiskScore: thresholds?.highRiskScore ?? 50,
            criticalRiskScore: thresholds?.criticalRiskScore ?? 70,
            concentrationLimit: thresholds?.concentrationLimit ?? 60,
            protocolRiskChange: thresholds?.protocolRiskChange ?? 10,
        };
    }

    /**
     * Check portfolio and generate alerts
     */
    checkPortfolio(
        totalRiskScore: number,
        positions: Array<{ protocol: string; percentage: number }>
    ): RiskAlert[] {
        const newAlerts: RiskAlert[] = [];

        // Check total risk score
        if (totalRiskScore >= this.thresholds.criticalRiskScore) {
            newAlerts.push({
                id: `risk-critical-${Date.now()}`,
                timestamp: new Date(),
                severity: 'CRITICAL',
                type: 'HIGH_RISK',
                message: `Portfolio risk score is critically high (${totalRiskScore}/100)`,
                recommendation:
                    'Immediately reduce exposure to high-risk protocols or diversify.',
            });
        } else if (totalRiskScore >= this.thresholds.highRiskScore) {
            newAlerts.push({
                id: `risk-high-${Date.now()}`,
                timestamp: new Date(),
                severity: 'HIGH',
                type: 'ELEVATED_RISK',
                message: `Portfolio risk score is elevated (${totalRiskScore}/100)`,
                recommendation: 'Consider rebalancing to lower-risk protocols.',
            });
        }

        // Check concentration
        for (const position of positions) {
            if (position.percentage >= this.thresholds.concentrationLimit) {
                newAlerts.push({
                    id: `concentration-${position.protocol}-${Date.now()}`,
                    timestamp: new Date(),
                    severity: 'HIGH',
                    type: 'CONCENTRATION_RISK',
                    message: `Overconcentrated in ${position.protocol} (${position.percentage.toFixed(1)}%)`,
                    recommendation: `Diversify to reduce ${position.protocol} exposure below ${this.thresholds.concentrationLimit}%.`,
                });
            }
        }

        this.alerts = [...this.alerts, ...newAlerts];
        return newAlerts;
    }

    /**
     * Get active alerts
     */
    getActiveAlerts(maxAge = 24 * 60 * 60 * 1000): RiskAlert[] {
        const cutoff = Date.now() - maxAge;
        return this.alerts.filter(
            alert => alert.timestamp.getTime() > cutoff
        );
    }

    /**
     * Clear old alerts
     */
    clearOldAlerts(maxAge = 24 * 60 * 60 * 1000): void {
        const cutoff = Date.now() - maxAge;
        this.alerts = this.alerts.filter(
            alert => alert.timestamp.getTime() > cutoff
        );
    }

    /**
     * Send alerts (placeholder for email/Telegram integration)
     */
    async sendAlerts(alerts: RiskAlert[]): Promise<void> {
        // TODO: Integrate with email service (SendGrid, Mailgun)
        // TODO: Integrate with Telegram Bot API

        console.log('📧 Sending risk alerts:', alerts);

        // For now, just log
        for (const alert of alerts) {
            console.log(
                `[${alert.severity}] ${alert.message} - ${alert.recommendation}`
            );
        }
    }

    /**
     * Get alert statistics
     */
    getAlertStats(maxAge = 7 * 24 * 60 * 60 * 1000): {
        total: number;
        bySeverity: Record<string, number>;
        byType: Record<string, number>;
    } {
        const activeAlerts = this.getActiveAlerts(maxAge);

        const bySeverity: Record<string, number> = {};
        const byType: Record<string, number> = {};

        for (const alert of activeAlerts) {
            bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
            byType[alert.type] = (byType[alert.type] || 0) + 1;
        }

        return {
            total: activeAlerts.length,
            by Severity,
            byType,
        };
    }
}
