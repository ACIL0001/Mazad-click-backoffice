

export default interface Device {
  isDevice: boolean;
  manufacturer: string;
  modelName: string;
  osVersion: string;
  deviceName: string;
  expoPushToken?: string;
  createdAt: Date;
  updatedAt?: Date;
}