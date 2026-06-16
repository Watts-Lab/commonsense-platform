type TreatmentInterface = {
  id?: number;
  name?: string;
  description?: string;
  published?: boolean;
  randomization?: boolean;
  seed?: number;
  createdAt?: Date;
};

export default TreatmentInterface;
