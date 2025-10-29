import { useMemo } from 'react';
import { DataProcessor } from '../services/data/DataProcessor';

export const useProcessedData = (rawData) => {
  return useMemo(() => {
    return DataProcessor.process(rawData);
  }, [rawData]);
};