import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { groupService } from '../../services/groupService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500';

const CreateGroup = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { maxMembers: 10, contributionFrequency: 'monthly', isPublic: false },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const groupData = {
        name: data.name,
        description: data.description,
        targetAmount: parseFloat(data.targetAmount),
        contributionAmount: parseFloat(data.contributionAmount),
        contributionFrequency: data.contributionFrequency,
        maxMembers: parseInt(data.maxMembers, 10),
        isPublic: data.isPublic,
      };

      const response = await groupService.createGroup(groupData);
      const groupId = response.id || response.group?.id;

      if (groupId) {
        navigate(`/groups/${groupId}`, { state: { message: 'Group created successfully!' } });
      } else {
        navigate('/groups', { state: { message: 'Group created successfully!' } });
      }
    } catch (err) {
      setError(err.message || 'Failed to create group. Please try again.');
      setLoading(false);
    }
  };

  if (loading) return <Loader centered size="large" />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create a New Savings Group</h1>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
              <input className={inputClass} {...register('name', { required: 'Group name is required' })} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea rows={3} className={inputClass} {...register('description', { required: 'Description is required' })} />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Members</label>
              <input
                type="number" min="2" max="100" className={inputClass}
                {...register('maxMembers', { required: true, min: 2, max: 100 })}
              />
              {errors.maxMembers && <p className="mt-1 text-xs text-red-500">Must be between 2 and 100</p>}
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500" {...register('isPublic')} />
              Make this group public (anyone can join)
            </label>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Savings Goal</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Amount (KES)</label>
              <input
                type="number" min="1" step="0.01" className={inputClass}
                {...register('targetAmount', { required: 'Target amount is required', min: { value: 1, message: 'Must be greater than 0' } })}
              />
              {errors.targetAmount && <p className="mt-1 text-xs text-red-500">{errors.targetAmount.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contribution Settings</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
              <select className={inputClass} {...register('contributionFrequency')}>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom / Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contribution Amount (KES)</label>
              <input
                type="number" min="1" step="0.01" className={inputClass}
                {...register('contributionAmount', { required: 'Contribution amount is required', min: { value: 1, message: 'Must be greater than 0' } })}
              />
              {errors.contributionAmount && <p className="mt-1 text-xs text-red-500">{errors.contributionAmount.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => navigate('/groups')}>Cancel</Button>
            <Button type="submit">Create Group</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateGroup;
