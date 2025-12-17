// Stream Video SDK Configuration
// Get your API key from https://dashboard.getstream.io/

export const STREAM_API_KEY = 'YOUR_STREAM_API_KEY'; // Replace with your Stream API key

// Call IDs are generated based on appointment IDs for consistency
export const generateCallId = (appointmentId: string): string => {
  return `pav-dental-${appointmentId}`;
};
