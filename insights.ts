
type BinaryProbability = 'low' | 'high'
type Insights = {
  killDiamondHolder: BinaryProbability
  vineDiamondHolder: BinaryProbability
  killFreeAgent: BinaryProbability
  vineFreeAgent: BinaryProbability
  dropOnProximity: BinaryProbability
}

const ALL_LOW: Readonly<Insights> = {
  killDiamondHolder: 'low',
  vineDiamondHolder: 'low',
  killFreeAgent: 'low',
  vineFreeAgent: 'low',
  dropOnProximity: 'low',
} as const


const forAndrew = (n: number, q: number): number => {
  const p = -(q / (1 - q)) * (n * q + 1) / (n * q - 1)
  return (0 <= p && p <= 1) ? p : 1
}

const numToBinaryProb = (n: number): BinaryProbability => n <= 1 ? 'low' : 'high'

class InsightsProvider {
  public occurrences: Record<string, Record<'killDiamondHolder' | 'vineDiamondHolder' | 'killFreeAgents' | 'vineFreeAgents', number>>
  constructor() {
    this.occurrences = {}
  }

  public insights(teamId: string): Insights {
    const occurrences = this.occurrences[teamId]
    return {
      killDiamondHolder: numToBinaryProb(occurrences?.['killDiamondHolder'] || 0),
      vineDiamondHolder: numToBinaryProb(occurrences?.['vineDiamondHolder'] || 0),
      killFreeAgent: numToBinaryProb(occurrences?.['killFreeAgents'] || 0),
      vineFreeAgent: numToBinaryProb(occurrences?.['vineFreeAgents'] || 0),
      dropOnProximity: 'low'
    }
  }
}

export { InsightsProvider, Insights, forAndrew }