import { motion } from 'framer-motion';
import { FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa';

const Support = () => {
  return (
    <div className="min-h-screen bg-[#e8f5d0] p-4 pb-24">
      {/* Header Card with Illustration */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl p-8 mb-6 text-center shadow-lg border-2 border-dashed border-gray-300"
      >
        <div className="mb-4">
          <img 
            src="/support.jpg" 
            alt="Customer Support" 
            className="w-48 h-32 mx-auto object-contain"
          />
        </div>
        <h1 className="text-4xl font-black text-red-500 mb-2">Need Help?</h1>
        <p className="text-gray-800 text-lg font-semibold">
          We're here to help you 24/7
        </p>
      </motion.div>

      {/* Contact Section */}
      <div className="mb-6">
        <h2 className="text-gray-800 font-bold text-xl mb-4">Contact Us At Below Platforms.</h2>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* WhatsApp Card */}
        <motion.a
          href="https://wa.me/918441952800"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-lg text-center hover:scale-105 transition-all"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaWhatsapp className="text-4xl text-white" />
          </div>
          <h3 className="text-gray-800 font-bold text-lg mb-2">WhatsApp</h3>
          <p className="text-gray-500 text-sm">Chat with us directly</p>
        </motion.a>

        {/* Email Card */}
        <motion.a
          href="mailto:support@a2zludo.com"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-lg text-center hover:scale-105 transition-all"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaEnvelope className="text-4xl text-white" />
          </div>
          <h3 className="text-gray-800 font-bold text-lg mb-2">Email Support</h3>
          <p className="text-gray-500 text-sm">Follow us for updates</p>
        </motion.a>
      </div>

      {/* Phone Support Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-6 shadow-lg"
      >
        <h3 className="text-gray-800 font-bold text-xl mb-4">Get instant help from our team</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <FaPhone className="text-3xl text-white" />
          </div>
          <div>
            <h4 className="text-gray-800 font-bold text-lg mb-1">Phone Support</h4>
            <a 
              href="tel:8078614076" 
              className="text-blue-500 text-2xl font-black hover:underline"
            >
              8078614076
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Support;
