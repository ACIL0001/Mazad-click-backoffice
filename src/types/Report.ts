import User from "./User";

export enum ReportType {
    FRAUDULENT_ACTIVITY = 'Fraudulent activity',
    DANGEROUS_OR_INAPPROPRIATE_BEHAVIOR = 'Dangerous or inappropriate behavior',
    PROBLEM_WITH_AD_OR_PROFILE = 'Problem with ad or profile',
    QUESTIONABLE_PRICE_OR_PAYMENT_METHOD = 'Questionable price or payment method'
  }
  
  
export default interface Report {
    _id?: string,
    user: User;
    subject: ReportType;
    closed?: Boolean
    createdBy?: User;
    createdAt?: Date;
    updatedAt?: Date;
}
