export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      signals: {
        Row: {
          id: string
          user_id: string
          pair: string
          type: 'Limit' | 'Market'
          position: 'Long' | 'Short' | 'Spot'
          leverage: number | null
          entries: Json
          stop_losses: Json
          take_profits: Json
          comments: string | null
          trading_view_url: string | null
          risk_reward: string | null
          created_at: string
          status: string
          telegram_message_id: number | null
          last_modification_id: number | null
        }
        Insert: {
          id?: string
          user_id: string
          pair: string
          type: 'Limit' | 'Market'
          position: 'Long' | 'Short' | 'Spot'
          leverage?: number | null
          entries?: Json
          stop_losses?: Json
          take_profits?: Json
          comments?: string | null
          trading_view_url?: string | null
          risk_reward?: string | null
          created_at?: string
          status: string
          telegram_message_id?: number | null
          last_modification_id?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          pair?: string
          type?: 'Limit' | 'Market'
          position?: 'Long' | 'Short' | 'Spot'
          leverage?: number | null
          entries?: Json
          stop_losses?: Json
          take_profits?: Json
          comments?: string | null
          trading_view_url?: string | null
          risk_reward?: string | null
          created_at?: string
          status?: string
          telegram_message_id?: number | null
          last_modification_id?: number | null
        }
      }
    }
  }
}