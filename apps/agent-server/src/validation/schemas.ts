import { z } from 'zod';

// ==================== Control Plane Schemas ====================

export const StartAgentRequestSchema = z.object({
    // Optional configuration overrides
    config: z.object({
        riskThreshold: z.number().min(0).max(100).optional(),
        checkInterval: z.number().min(1000).optional(), // milliseconds
    }).optional()
});

export const StopAgentRequestSchema = z.object({
    graceful: z.boolean().optional().default(true)
});

// ==================== Yield Route Schemas ====================

export const AssetParamSchema = z.object({
    asset: z.string().regex(/^[A-Z]{3,10}$/, 'Asset must be uppercase 3-10 characters')
});

export const RebalanceCheckRequestSchema = z.object({
    currentProtocol: z.string().min(1),
    asset: z.string().regex(/^[A-Za-z]{3,10}$/),
    amount: z.string().regex(/^\d+(\.\d{1,18})?$/, 'Amount must be valid number string'),
    gasPrice: z.number().min(0).max(10000).optional(), // gwei, max 10,000 for sanity
});

// ==================== Status & Risk Schemas ====================

export const AddressParamSchema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
});

// ==================== Type Exports ====================

export type StartAgentRequest = z.infer<typeof StartAgentRequestSchema>;
export type StopAgentRequest = z.infer<typeof StopAgentRequestSchema>;
export type AssetParam = z.infer<typeof AssetParamSchema>;
export type RebalanceCheckRequest = z.infer<typeof RebalanceCheckRequestSchema>;
export type AddressParam = z.infer<typeof AddressParamSchema>;

// ==================== Validation Middleware ====================

export function validateRequest<T extends z.ZodType>(schema: T) {
    return async (request: any, reply: any) => {
        try {
            const validated = await schema.parseAsync(request.body || request.params || request.query);
            request.validatedData = validated;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({
                    error: 'Validation failed',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            throw error;
        }
    };
}
