const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="mb-10 bg-white rounded-2xl shadow-lg p-8 border-t-4 border-black">
        <h1 className="text-4xl font-bold text-black mb-3 tracking-tight">Profile Settings</h1>
        <p className="text-gray-600 text-base">Manage your account and preferences</p>
      </div>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-8 mb-8">
            <div className="relative group">
              <div className="w-28 h-28 bg-gradient-to-br from-black to-gray-700 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-xl transform group-hover:scale-105 transition-transform duration-300">DS</div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-2xl transition-all duration-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">Dennis Sharon</h2>
              <p className="text-gray-600 text-base mb-3">dennis.sharon@email.com</p>
              <button className="px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 text-sm font-semibold shadow-md">Change Profile Picture</button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-black rounded-full"></div>
              <h3 className="text-xl font-bold text-black">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Name</label>
                <input type="text" defaultValue="Dennis Sharon" className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all duration-300 font-medium hover:border-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
                <input type="email" defaultValue="dennis.sharon@email.com" className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all duration-300 font-medium hover:border-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone Number</label>
                <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all duration-300 font-medium hover:border-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Risk Tolerance</label>
                <select className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all duration-300 font-medium hover:border-gray-400 cursor-pointer">
                  <option>Conservative</option>
                  <option>Moderate</option>
                  <option>Aggressive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-black rounded-full"></div>
            <h3 className="text-xl font-bold text-black">Investment Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-black transition-all duration-300 group">
              <div>
                <p className="font-bold text-black text-base mb-1">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates about your investments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-md peer-checked:bg-black"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-black transition-all duration-300 group">
              <div>
                <p className="font-bold text-black text-base mb-1">Price Alerts</p>
                <p className="text-sm text-gray-600">Get notified of significant price changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-md peer-checked:bg-black"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-black transition-all duration-300 group">
              <div>
                <p className="font-bold text-black text-base mb-1">Weekly Summary</p>
                <p className="text-sm text-gray-600">Receive a weekly portfolio summary</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-md peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-black rounded-full"></div>
            <h3 className="text-xl font-bold text-black">Security</h3>
          </div>
          <div className="space-y-4">
            <button className="w-full text-left p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-black transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-black text-base mb-1">Change Password</p>
                  <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                </div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <button className="w-full text-left p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-black transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-black text-base mb-1">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <span className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-lg shadow-md"> ENABLED</span>
              </div>
            </button>
          </div>
        </div>
        <div className="flex gap-5">
          <button className="flex-1 bg-black text-white px-8 py-5 rounded-xl hover:bg-gray-800 transition-all duration-300 font-bold text-base transform hover:scale-105 shadow-lg hover:shadow-2xl">Save Changes</button>
          <button className="px-8 py-5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-black transition-all duration-300 font-bold text-base transform hover:scale-105 shadow-md">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
