import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateDispute } from '@/hooks/useDispute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhotoUpload } from '@/components/forms/PhotoUpload';
import { useToast } from '@/components/ui/Toast';

export const DisputeForm = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const { mutateAsync: createDispute, isPending } = useCreateDispute();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [photos, setPhotos] = useState([]);

  if (!bookingId) return <div className="p-8 text-center text-danger">Invalid booking reference</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (photos.length === 0) {
      addToast({ title: 'Error', message: 'Please upload at least one photo showing the damage', type: 'error' });
      return;
    }

    try {
      const photoUrls = photos.map(p => p.preview || p.url);
      const dispute = await createDispute({
        bookingId,
        description,
        claimedAmount: Number(amount) * 100, // convert to paise
        evidencePhotos: photoUrls
      });
      addToast({ title: 'Success', message: 'Dispute opened. The renter has been notified.', type: 'success' });
      navigate(`/dispute/${dispute.id}`);
    } catch (err) {
      addToast({ title: 'Error', message: err.response?.data?.message || 'Failed to open dispute', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Open a Dispute</h1>
      <p className="text-text-muted mb-8">
        We're sorry to hear there was an issue with your rental. Please provide details below. The renter's deposit is now frozen.
      </p>

      <form onSubmit={handleSubmit} className="bg-surface rounded-card p-6 md:p-8 border border-border shadow-sm space-y-6">
        <div className="w-full flex flex-col gap-1">
          <label className="text-sm font-medium text-text-main">What happened?</label>
          <textarea 
            required
            className="input-field bg-surface min-h-[120px] py-3"
            placeholder="Describe the damage, missing items, or late return details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Input
          label="Claim Amount (₹)"
          type="number"
          required
          min={1}
          placeholder="Amount needed to repair/replace"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <p className="text-xs text-text-muted -mt-4">This cannot exceed the total security deposit held.</p>

        <div>
          <label className="block text-sm font-medium text-text-main mb-2">
            Evidence (Photos/Repair Bills)
          </label>
          <PhotoUpload 
            photos={photos} 
            onChange={setPhotos} 
            minPhotos={1} 
            maxPhotos={5} 
          />
        </div>

        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="danger" isLoading={isPending}>Submit Dispute</Button>
        </div>
      </form>
    </div>
  );
};

export default DisputeForm;
