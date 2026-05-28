'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QrCode, Plus, Search } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/session/create', { method: 'POST' });
      if (response.ok) {
        const session = await response.json();
        router.push(`/transfer/${session.id}`);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim()) return;

    setJoinLoading(true);
    try {
      const response = await fetch('/api/session/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: sessionCode.trim() }),
      });

      if (response.ok) {
        const session = await response.json();
        router.push(`/transfer/${session.id}`);
      } else {
        alert('Invalid or expired session code');
      }
    } catch (error) {
      console.error('Failed to join session:', error);
      alert('Failed to join session');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">QuickShare</h1>
          <p className="text-xl text-slate-300">Transfer files between devices instantly</p>
          <p className="text-slate-400 text-sm mt-2">Up to 5MB per file • QR code or numeric code • 15 minute sessions</p>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Create New Session */}
          <Card className="bg-slate-800 border-slate-700 p-8 hover:border-blue-500 transition cursor-pointer" onClick={handleCreateSession}>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Create New Session</h2>
              <p className="text-slate-300 mb-6">Start a new transfer session and share your code or QR</p>
              <Button disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? 'Creating...' : 'Create Session'}
              </Button>
            </div>
          </Card>

          {/* Join Existing Session */}
          <Card className="bg-slate-800 border-slate-700 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Join Session</h2>
              <p className="text-slate-300 mb-6">Enter a 6-digit code to join an existing session</p>
              <form onSubmit={handleJoinSession} className="w-full">
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={sessionCode}
                  onChange={e => setSessionCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-center text-xl font-bold tracking-widest mb-4"
                />
                <Button
                  type="submit"
                  disabled={joinLoading || sessionCode.length !== 6}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {joinLoading ? 'Joining...' : 'Join Session'}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Features */}
        <Card className="bg-slate-800 border-slate-700 p-8">
          <h3 className="text-lg font-semibold text-white mb-6">How it works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-2">1</div>
              <p className="text-slate-300 text-sm">Create a session on your PC and get a code or QR</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-2">2</div>
              <p className="text-slate-300 text-sm">Scan the QR or enter code on your phone browser</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-2">3</div>
              <p className="text-slate-300 text-sm">Upload or download files instantly</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
