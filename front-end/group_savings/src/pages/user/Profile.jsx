import React, { useState } from 'react';
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import UserAvatar from '../../components/dashboard/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const Profile = () => {
  const { currentUser, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    phoneNumber: currentUser?.phoneNumber || '',
  });
  const [profileMessage, setProfileMessage] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage(null);
    setProfileError(null);
    try {
      setSavingProfile(true);
      await authService.updateProfile(profileForm);
      setProfileMessage('Profile updated successfully.');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center py-4">
        <UserAvatar user={currentUser} size="xlarge" />
        <h1 className="text-lg font-bold text-gray-900 dark:text-white mt-3">
          {currentUser?.firstName} {currentUser?.lastName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
      </div>

      <Card className="p-4" title="Edit Profile">
        <form onSubmit={handleProfileSubmit} className="space-y-3 mt-3">
          {profileMessage && <Alert type="success" message={profileMessage} onClose={() => setProfileMessage(null)} />}
          {profileError && <Alert type="error" message={profileError} onClose={() => setProfileError(null)} />}
          <Input
            label="First Name"
            value={profileForm.firstName}
            onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
          />
          <Input
            label="Last Name"
            value={profileForm.lastName}
            onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
          />
          <Input
            label="Phone Number"
            value={profileForm.phoneNumber}
            onChange={(e) => setProfileForm((p) => ({ ...p, phoneNumber: e.target.value }))}
          />
          <Button type="submit" disabled={savingProfile} fullWidth>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      <Card className="p-4" title="Change Password">
        <form onSubmit={handlePasswordSubmit} className="space-y-3 mt-3">
          {passwordMessage && <Alert type="success" message={passwordMessage} onClose={() => setPasswordMessage(null)} />}
          {passwordError && <Alert type="error" message={passwordError} onClose={() => setPasswordError(null)} />}
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
          />
          <Button type="submit" variant="outline" disabled={savingPassword} fullWidth>
            {savingPassword ? 'Updating...' : 'Change Password'}
          </Button>
        </form>
      </Card>

      <Button variant="danger" fullWidth onClick={logout} icon={<HiOutlineArrowRightOnRectangle className="h-5 w-5" />}>
        Log Out
      </Button>
    </div>
  );
};

export default Profile;
