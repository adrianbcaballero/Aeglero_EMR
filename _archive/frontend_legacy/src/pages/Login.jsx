
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChoiceCard from "../components/ChoiceCard";
import LoginFormCard from "../components/LoginForm";
import CreateAccountCard from "../components/CreateAcc";
import "../styles/Login.css"

const LoginPage = () => {
    const [selectedRole, setSelectedRole] = useState(null);

    const goBack = () => setSelectedRole(null);

    const renderCard = () => {
        switch (selectedRole) {
          case 'student':
          case 'advisor':
            return <LoginFormCard role={selectedRole} goBack={goBack} />;
          case 'create':
            return <CreateAccountCard goBack={goBack} />;
          default:
            return <ChoiceCard onSelect={setSelectedRole} />;
        }
    };

    return (
        <div className="lin">
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedRole || 'select-role'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {renderCard()}
        </motion.div>
      </AnimatePresence>
    </div>
    );
};

export default LoginPage;