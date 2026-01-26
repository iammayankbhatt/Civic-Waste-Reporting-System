import { useForm } from 'react-hook-form';
import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function ReportWaste() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm(); // Added errors
  const [loading, setLoading] = useState(false);
  const [locStatus, setLocStatus] = useState('Not fetched'); // Visual feedback
  const navigate = useNavigate();

  const getLocation = () => {
    if (navigator.geolocation) {
      setLocStatus('Fetching...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
          setLocStatus('✅ Location Secured');
        },
        (error) => {
          setLocStatus('❌ Failed to get location');
          alert("Please enable location services.");
        }
      );
    }
  };

  const onSubmit = async (data) => {
    // Manual check to ensure lat/long exist
    if (!data.latitude || !data.longitude) {
      alert("Please click 'Get Current Location' before submitting.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('latitude', data.latitude);
    formData.append('longitude', data.longitude);
    formData.append('image', data.image[0]);

    try {
      await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Report Submitted Successfully!');
      // Reset form or redirect
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert('Failed to submit report. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Centering Fix: flex, justify-center, w-full
    <div className="flex justify-center w-full mt-10">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Report an Issue</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              {...register('description', { required: "Description is required" })} 
              className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-green-500"
              placeholder="E.g., Large pile of garbage near the park..."
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select {...register('category')} className="w-full p-2 border rounded mt-1">
              <option value="Garbage">Garbage Dump</option>
              <option value="Litter">Littering</option>
              <option value="Construction">Construction Waste</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded border border-dashed border-gray-300 text-center">
            <p className="text-sm text-gray-600 mb-2">Location Status: <span className="font-bold">{locStatus}</span></p>
            <button type="button" onClick={getLocation} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
              📍 Get Current Location
            </button>
            {/* Hidden Inputs */}
            <input type="hidden" {...register('latitude')} />
            <input type="hidden" {...register('longitude')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Photo</label>
            <input 
              type="file" 
              {...register('image', { required: "Image is required" })} 
              accept="image/*"
              className="w-full mt-1"
            />
            {errors.image && <p className="text-red-500 text-xs">{errors.image.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}