export type GeneralMetrics = {
  heightFeet?: number;
  heightInches?: number;
  weight?: number;
  fortyYardDash?: number;
  shuttleRun?: number;
  verticalJump?: number;
};

export type PositionMetrics = {
  passingYards?: number;
  rushingYards?: number;
  receivingYards?: number;
  tackles?: number;
  sacks?: number;
};

export type Metrics = GeneralMetrics & PositionMetrics; 