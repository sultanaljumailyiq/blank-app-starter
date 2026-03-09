export interface AIResult {
    issues: Array<{
        label: string;
        confidence: number;
        box?: [number, number, number, number]; // x, y, width, height (normalized 0-1)
        description?: string;
    }>;
    summary: string;
    recommendation: string;
}

export const analyzeImageMock = async (imageUrl: string): Promise<AIResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Randomize results slightly for demo
    const hasIssues = Math.random() > 0.3;

    if (!hasIssues) {
        return {
            issues: [],
            summary: "Did not detect any significant anomalies.",
            recommendation: "Routine check-up recommended."
        };
    }

    return {
        issues: [
            {
                label: "Caries",
                confidence: 0.92,
                box: [0.3, 0.4, 0.1, 0.1],
                description: "Deep cavity detected in molar."
            },
            {
                label: "Bone Loss",
                confidence: 0.78,
                box: [0.6, 0.7, 0.15, 0.1],
                description: "Signs of early periodontal bone loss."
            }
        ],
        summary: "Detected potential caries and early bone loss markers.",
        recommendation: "Suggest detailed manual inspection and X-ray confirmation."
    };
};
