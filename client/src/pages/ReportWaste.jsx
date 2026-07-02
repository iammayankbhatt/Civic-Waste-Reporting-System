import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function ReportWaste() {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [locStatus, setLocStatus] = useState('Not fetched');
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // Watch the image field changes to automatically grab filename and preview
  const selectedImage = watch('image');

  useEffect(() => {
    if (selectedImage && selectedImage.length > 0) {
      const file = selectedImage[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Clean up memory when component unmounts or image changes
      return () => URL.revokeObjectURL(previewUrl);
    } else {
      setImagePreview(null);
    }
  }, [selectedImage]);

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

  const handleRemoveImage = () => {
    setValue('image', null);
    setImagePreview(null);
  };

  const onSubmit = async (data) => {
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
      reset(); 
      setLocStatus('Not fetched');
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      alert('Failed to submit report. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full mt-10 mb-10">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Report an Issue</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              {...register('description', { required: "Description is required" })} 
              className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-green-500 text-gray-800"
              placeholder="E.g., Large pile of garbage near the park..."
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select {...register('category')} className="w-full p-2 border rounded mt-1 text-gray-800">
              <option value="Garbage">Garbage Dump</option>
              <option value="Litter">Littering</option>
              <option value="Construction">Construction Waste</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded border border-dashed border-gray-300 text-center">
            <p className="text-sm text-gray-600 mb-2">Location Status: <span className="font-bold">{locStatus}</span></p>
            <button type="button" onClick={getLocation} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-semibold transition">
              📍 Get Current Location
            </button>
            <input type="hidden" {...register('latitude')} />
            <input type="hidden" {...register('longitude')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo</label>
            
            {!imagePreview ? (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-400">PNG, JPG or JPEG</p>
                  </div>
                  <input 
                    type="file" 
                    {...register('image', { required: "Image is required" })} 
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="border rounded-lg p-3 bg-gray-50 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="truncate max-w-[70%]">
                    <p className="text-xs text-gray-400">Selected File Name:</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{selectedImage[0]?.name}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleRemoveImage}
                    className="text-xs bg-red-50 px-2 py-1 rounded text-red-600 border border-red-200 hover:bg-red-100 transition font-semibold"
                  >
                    ✕ Remove / Edit
                  </button>
                </div>
                <div className="flex justify-center">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-40 w-full object-cover rounded-md shadow-sm border"
                  />
                </div>
              </div>
            )}
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition disabled:opacity-50 shadow-md"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}