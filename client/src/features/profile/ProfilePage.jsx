import { useAuthContext } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Mail, Phone, MapPin, Calendar, Camera } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuthContext();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-surface rounded-card border border-border shadow-sm p-8 flex flex-col md:flex-row gap-8 items-start mb-8">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl text-primary font-bold">{user.name.charAt(0)}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
              <div className="flex items-center gap-2 text-text-muted">
                <MapPin className="w-4 h-4" />
                <span>{user.city || 'No city provided'}</span>
                <span>•</span>
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.createdAt).getFullYear()}</span>
              </div>
            </div>
            <Link to="/profile/edit">
              <Button variant="secondary">Edit Profile</Button>
            </Link>
          </div>

          <p className="text-text-main mb-6 whitespace-pre-wrap">
            {user.bio || 'This user hasn\'t written a bio yet.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-surface-alt p-3 rounded-card">
              <Mail className="w-5 h-5 text-text-muted" />
              <div className="flex-1">
                <p className="text-xs text-text-muted">Email</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{user.email}</span>
                  {user.emailVerified && <ShieldCheck className="w-4 h-4 text-success" />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-surface-alt p-3 rounded-card">
              <Phone className="w-5 h-5 text-text-muted" />
              <div className="flex-1">
                <p className="text-xs text-text-muted">Phone</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{user.phone || 'Not provided'}</span>
                  {user.phoneVerified && <ShieldCheck className="w-4 h-4 text-success" />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-surface-alt p-3 rounded-card">
              <Star className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <p className="text-xs text-text-muted">Rating</p>
                <span className="text-sm font-medium">{user.rating || 'No ratings'} ({user.completedRentals || 0} rentals)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Example My Listings Section */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5" />
        My Listings
      </h2>
      <div className="text-text-muted p-8 text-center bg-surface border border-border rounded-card">
        You haven't listed any gear yet. <Link to="/items/new" className="text-primary hover:underline">Start earning now.</Link>
      </div>
    </div>
  );
};

export default ProfilePage;
