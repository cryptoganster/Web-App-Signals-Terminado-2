// Types related to signal status
export type SignalStatus = 
  | 'active' 
  | 'pending' 
  | 'completed' 
  | 'partial profits'
  | 'stopped' 
  | `take-profit-${number}` 
  | `stop-loss-${number}` 
  | `entry-${number}`;

// Rest of the file remains the same...