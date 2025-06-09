import React, { useState, useEffect } from 'react';
import { User, Building, Mail, Phone, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  company_address: string | null;
  phone: string | null;
}

export function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    company_name: '',
    company_address: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setProfileForm({
          full_name: data.full_name || '',
          company_name: data.company_name || '',
          company_address: data.company_address || '',
          phone: data.phone || '',
        });
      } else {
        // Create profile if it doesn't exist using upsert to avoid duplicate key errors
        const newProfile = {
          id: user!.id,
          email: user!.email!,
          full_name: user!.user_metadata?.full_name || '',
          company_name: null,
          company_address: null,
          phone: null,
        };

        const { data: upsertedData, error: upsertError } = await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' })
          .select()
          .single();

        if (upsertError) throw upsertError;
        
        setProfile(upsertedData);
        setProfileForm({
          full_name: upsertedData.full_name || '',
          company_name: upsertedData.company_name || '',
          company_address: upsertedData.company_address || '',
          phone: upsertedData.phone || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          company_name: profileForm.company_name || null,
          company_address: profileForm.company_address || null,
          phone: profileForm.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (error) throw error;

      // Reload profile
      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage your account and business information</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Update your personal and business details
            </p>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                placeholder="Your full name"
              />
              
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                className="bg-slate-50"
                hint="Email cannot be changed"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Building className="w-4 h-4" />
                <span className="font-medium">Business Information</span>
              </div>
              
              <Input
                label="Company Name"
                value={profileForm.company_name}
                onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                placeholder="Your company name"
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company Address
                </label>
                <textarea
                  value={profileForm.company_address}
                  onChange={(e) => setProfileForm({ ...profileForm, company_address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your business address"
                />
              </div>
              
              <Input
                label="Phone Number"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="Your phone number"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button type="submit" loading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Account Information */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Account Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Email Address</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Verified
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Account Type</p>
                  <p className="text-sm text-slate-500">Professional</p>
                </div>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}