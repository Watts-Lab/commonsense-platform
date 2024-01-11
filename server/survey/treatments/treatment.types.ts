// Original TreatmentInterface



type TreatmentInterface = {
  id?: number;
  name?: string;
  description?: string;
  published?: boolean;
  randomization?: boolean;
  seed?: number;
  createdAt?: Date;
};

// Design point conditions
type DesignSpace = {
  behavior: boolean;
  everyday: boolean;
  figure_of_speech: boolean;
  judgment: boolean;
  opinion: boolean;
  reasoning: boolean;
};

// New type that extends TreatmentInterface with the addition of ConditionBooleans
type TreatmentWithDesignSpaceInterface = TreatmentInterface & {
  conditions: DesignSpace;
};

export { TreatmentWithDesignSpaceInterface, TreatmentInterface };
