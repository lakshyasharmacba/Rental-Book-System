import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhotoUpload } from '@/components/forms/PhotoUpload';
import { LocationPicker } from '@/components/map/LocationPicker';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/api';

export const CreateItemPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    pricePerDay: '',
    depositAmount: '',
    photos: [],
    location: null,
  });

  const uploadPhotos = async (photos) => {
    // In a real app, upload to S3/Cloudinary and return URLs
    // Here we'll simulate it by returning mock URLs or base64
    return photos.map(p => p.preview); 
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const photoUrls = await uploadPhotos(formData.photos);
      
      const payload = {
        ...formData,
        pricePerDay: Number(formData.pricePerDay) * 100, // Convert to paise
        depositAmount: Number(formData.depositAmount) * 100,
        photos: photoUrls,
        lat: formData.location.lat,
        lng: formData.location.lng,
      };

      const { data } = await api.post('/items', payload);
      addToast({ title: 'Success', message: 'Item listed successfully!', type: 'success' });
      navigate(`/items/${data.id}`);
    } catch (err) {
      addToast({ 
        title: 'Error', 
        message: err.response?.data?.message || 'Failed to list item', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main">List your gear</h1>
        <p className="text-text-muted mt-2">Step {step} of 4</p>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-surface-alt rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-surface rounded-card p-6 md:p-8 border border-border shadow-sm">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-semibold">Basic Details</h2>
            <Input
              label="Item Title"
              placeholder="e.g. Sony A7IV + 24-70mm Lens"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <div className="w-full flex flex-col gap-1">
              <label className="text-sm font-medium text-text-main">Category</label>
              <select 
                className="input-field bg-surface"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select a category</option>
                <option value="Cameras">Cameras</option>
                <option value="Lenses">Lenses</option>
                <option value="Lighting">Lighting</option>
                <option value="Audio">Audio</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div className="w-full flex flex-col gap-1">
              <label className="text-sm font-medium text-text-main">Description</label>
              <textarea 
                className="input-field bg-surface min-h-[120px] py-3"
                placeholder="Describe the condition, included accessories, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-semibold">Photos</h2>
            <p className="text-sm text-text-muted mb-4">
              Add at least 4 clear photos showing the condition of your item from different angles.
            </p>
            <PhotoUpload 
              photos={formData.photos}
              onChange={(photos) => setFormData({ ...formData, photos })}
              minPhotos={4}
              maxPhotos={10}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-semibold">Location</h2>
            <p className="text-sm text-text-muted mb-4">
              Pin exactly where the renter should pick up the gear. This exact location is only shared after booking.
            </p>
            <LocationPicker 
              value={formData.location}
              onChange={(loc) => setFormData({ ...formData, location: loc })}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-semibold">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Price per day (₹)"
                type="number"
                placeholder="1500"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
              />
              <Input
                label="Security Deposit (₹)"
                type="number"
                placeholder="5000"
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
              />
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-card mt-6">
              <h4 className="font-semibold text-blue-900 mb-1">How pricing works</h4>
              <p className="text-sm text-blue-800">
                You keep 90% of the daily rate. RentLens charges a 10% platform fee to the renter. 
                The security deposit is fully refunded to the renter if the item is returned safely.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-border">
          <Button 
            variant="secondary" 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1 || isLoading}
          >
            Back
          </Button>
          
          {step < 4 ? (
            <Button 
              onClick={() => setStep(s => Math.min(4, s + 1))}
              disabled={
                (step === 1 && (!formData.title || !formData.category)) ||
                (step === 2 && formData.photos.length < 4) ||
                (step === 3 && !formData.location)
              }
            >
              Next Step
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!formData.pricePerDay}
            >
              Publish Listing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateItemPage;
