import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispute } from '@/hooks/useDispute';
import { useAuthContext } from '@/app/providers';
import { DisputeThread } from './DisputeThread';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatPrice, formatDate } from '@/lib/utils';
import { AlertCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

export const DisputePage = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { addToast } = useToast();
  const { data: dispute, isLoading, refetch } = useDispute(id);

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!dispute?.deadline) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(dispute.deadline).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${mins}m`);
    }, 1000);
    return () => clearInterval(interval);
  }, [dispute]);

  if (isLoading || !dispute) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const isRenter = user?.id === dispute.renterId;
  const isOwner = user?.id === dispute.ownerId;
  const isAdmin = user?.role === 'admin';
  const isOpen = dispute.status === 'OPEN';

  const handleRenterAction = async (action) => {
    try {
      await api.post(`/disputes/${id}/renter-action`, { action }); // accept, deny
      addToast({ title: 'Success', message: 'Action recorded', type: 'success' });
      refetch();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to record action', type: 'error' });
    }
  };

  const handleAdminResolve = async (action) => {
    try {
      await api.post(`/disputes/${id}/admin-resolve`, { action }); // favor_owner, favor_renter, split
      addToast({ title: 'Resolved', message: 'Dispute has been resolved', type: 'success' });
      refetch();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to resolve', type: 'error' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            Dispute #{dispute.id.slice(0,8)}
            <Badge variant={isOpen ? 'red' : 'gray'}>{dispute.status}</Badge>
          </h1>
          <p className="text-text-muted">Booking: {dispute.booking.item.title}</p>
        </div>
        
        {isOpen && timeLeft && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-card border border-red-200">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Auto-resolves in: {timeLeft}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Details & Photos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-card p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4">Owner's Claim</h2>
            <div className="flex justify-between items-center bg-surface-alt p-4 rounded mb-4">
              <span className="text-text-muted">Amount Requested</span>
              <span className="text-xl font-bold text-danger">{formatPrice(dispute.claimedAmount)}</span>
            </div>
            <p className="whitespace-pre-wrap text-text-main mb-6">{dispute.description}</p>
            
            <h3 className="font-medium mb-3">Evidence Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dispute.evidencePhotos?.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square rounded overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-card p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4">Condition Baseline (From Booking)</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-text-muted mb-2">Pickup Photos</h4>
                <div className="grid grid-cols-2 gap-2">
                  {dispute.booking.pickupPhotos?.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square rounded overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-muted mb-2">Return Photos</h4>
                <div className="grid grid-cols-2 gap-2">
                  {dispute.booking.returnPhotos?.length > 0 ? dispute.booking.returnPhotos.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square rounded overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </a>
                  )) : (
                    <p className="text-sm text-text-muted italic">None provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Thread & Controls */}
        <div className="space-y-6">
          {isOpen && isRenter && (
            <div className="bg-surface p-6 rounded-card border border-border shadow-md">
              <h3 className="font-semibold mb-2">Renter Action Required</h3>
              <p className="text-sm text-text-muted mb-4">Do you accept the owner's claim of {formatPrice(dispute.claimedAmount)}?</p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleRenterAction('accept')}>Accept Claim</Button>
                <Button variant="secondary" onClick={() => handleRenterAction('deny')}>Deny & escalate to Admin</Button>
              </div>
            </div>
          )}

          {isOpen && isAdmin && (
            <div className="bg-primary/5 p-6 rounded-card border border-primary/20 shadow-md">
              <h3 className="font-semibold text-primary-900 mb-2">Admin Resolution Panel</h3>
              <p className="text-sm text-primary-800 mb-4">Force resolve this dispute based on evidence.</p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleAdminResolve('favor_owner')} className="bg-primary hover:bg-primary-hover text-white">Favor Owner (Release claim amt)</Button>
                <Button onClick={() => handleAdminResolve('favor_renter')} className="bg-surface text-primary border border-primary/20">Favor Renter (Refund full deposit)</Button>
                <Button onClick={() => handleAdminResolve('split')} className="bg-surface text-primary border border-primary/20">Split 50/50</Button>
              </div>
            </div>
          )}

          <div className="sticky top-24">
            <h3 className="font-semibold mb-3">Discussion Thread</h3>
            <DisputeThread disputeId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputePage;
