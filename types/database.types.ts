export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            customers: {
                Row: {
                    created_at: string
                    email: string | null
                    full_name: string
                    id: string
                    person_id: string | null
                    phone: string | null
                    studio_id: string
                }
                Insert: {
                    created_at?: string
                    email?: string | null
                    full_name: string
                    id?: string
                    person_id?: string | null
                    phone?: string | null
                    studio_id: string
                }
                Update: {
                    created_at?: string
                    email?: string | null
                    full_name?: string
                    id?: string
                    person_id?: string | null
                    phone?: string | null
                    studio_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "customers_studio_id_fkey"
                        columns: ["studio_id"]
                        isOneToOne: false
                        referencedRelation: "studios"
                        referencedColumns: ["id"]
                    },
                ]
            }
            inventory_items: {
                Row: {
                    batch_number: string | null
                    brand: string | null
                    created_at: string
                    expires_at: string | null
                    id: string
                    name: string
                    opened_at: string | null
                    started_at: string | null
                    studio_id: string
                    type: string | null
                    quantity_ml: number | null
                }
                Insert: {
                    batch_number?: string | null
                    brand?: string | null
                    created_at?: string
                    expires_at?: string | null
                    id?: string
                    name: string
                    opened_at?: string | null
                    studio_id: string
                    type?: string | null
                    quantity_ml?: number | null
                }
                Update: {
                    batch_number?: string | null
                    brand?: string | null
                    created_at?: string
                    expires_at?: string | null
                    id?: string
                    name?: string
                    opened_at?: string | null
                    studio_id?: string
                    type?: string | null
                    quantity_ml?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "inventory_items_studio_id_fkey"
                        columns: ["studio_id"]
                        isOneToOne: false
                        referencedRelation: "studios"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    created_at: string
                    full_name: string | null
                    id: string
                    role: string | null
                    studio_id: string | null
                }
                Insert: {
                    created_at?: string
                    full_name?: string | null
                    id: string
                    role?: string | null
                    studio_id?: string | null
                }
                Update: {
                    created_at?: string
                    full_name?: string | null
                    id?: string
                    role?: string | null
                    studio_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_studio_id_fkey"
                        columns: ["studio_id"]
                        isOneToOne: false
                        referencedRelation: "studios"
                        referencedColumns: ["id"]
                    },
                ]
            }
            session_items: {
                Row: {
                    id: string
                    item_id: string
                    session_id: string
                    studio_id: string
                }
                Insert: {
                    id?: string
                    item_id: string
                    session_id: string
                    studio_id: string
                }
                Update: {
                    id?: string
                    item_id?: string
                    session_id?: string
                    studio_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "session_items_item_id_fkey"
                        columns: ["item_id"]
                        isOneToOne: false
                        referencedRelation: "inventory_items"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "session_items_session_id_fkey"
                        columns: ["session_id"]
                        isOneToOne: false
                        referencedRelation: "sessions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "session_items_studio_id_fkey"
                        columns: ["studio_id"]
                        isOneToOne: false
                        referencedRelation: "studios"
                        referencedColumns: ["id"]
                    },
                ]
            }
            sessions: {
                Row: {
                    artist_id: string
                    created_at: string
                    customer_id: string
                    id: string
                    notes: string | null
                    performed_at: string
                    studio_id: string
                }
                Insert: {
                    artist_id: string
                    created_at?: string
                    customer_id: string
                    id?: string
                    notes?: string | null
                    performed_at?: string
                    studio_id: string
                }
                Update: {
                    artist_id?: string
                    created_at?: string
                    customer_id?: string
                    id?: string
                    notes?: string | null
                    performed_at?: string
                    studio_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "sessions_artist_id_fkey"
                        columns: ["artist_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "sessions_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "sessions_studio_id_fkey"
                        columns: ["studio_id"]
                        isOneToOne: false
                        referencedRelation: "studios"
                        referencedColumns: ["id"]
                    },
                ]
            }
            studios: {
                Row: {
                    created_at: string
                    id: string
                    name: string
                    org_number: string | null
                }
                Insert: {
                    created_at?: string
                    id?: string
                    name: string
                    org_number?: string | null
                }
                Update: {
                    created_at?: string
                    id?: string
                    name?: string
                    org_number?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_auth_studio_id: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

