import React, { useState } from 'react';
import { useUser } from '../Context';
import { Card, CardHeader, CardBody, CardFooter, Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MoodSlider from '../components/MoodSlider';
import ColorChoice from '../components/ColorChoice';
import ImageSelector from '../components/ImageSelector';

import '../styles/Student.css';

const StudentMainForm = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [page, setPage] = useState(0);
  const [formData, setFormData] = useState({
    mood: 50,
    color: '',
    image: '',
  });

  function next() {
    setPage(page + 1);
  }
  function back() {
    setPage((prev) => prev - 1);
  }

  function saveData(data) {
    localStorage.setItem('mood', data.mood);
    localStorage.setItem('color', data.color);
    localStorage.setItem('image', data.image);
  }


  const nextPage = async() =>
  {
      saveData(formData);
        navigate('/transition');
  };

  

  return (
    <div className="snt">
      
      <Card className="snt-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {page === 0 && (
              <CardHeader className="snt-card-header">
                <h1>Hello, {user.name}!</h1>
              </CardHeader>
            )}

            <CardBody className="snt-card-body">
              {page === 0 && (
                <MoodSlider
                  value={formData.mood}
                  onChange={(val) => setFormData((f) => ({ ...f, mood: val }))}
                />
              )}
              {page === 1 && (
                <ColorChoice
                  selectedColor={formData.color}
                  onSelect={(color) => setFormData({ ...formData, color })}
                />
              )}
              {page === 2 && (
                <ImageSelector
                  selectedImage={formData.image}
                  onSelect={(image) => setFormData({ ...formData, image })}
                />
              )}
            </CardBody>

            <CardFooter className="snt-card-footer px-4 py-2">
              <div className="w-full flex justify-between items-center">
                {page > 0 ? (
                  <Button className="snt-button" onPress={back}>
                    Back
                  </Button>
                ) : (
                  <span />
                )}

                {page < 2 ? (
                  <Button className="snt-button" onPress={next}>
                    Next
                  </Button>
                ) : (
                  <Button className="snt-submit" onPress={nextPage}>
                    Submit
                  </Button>
                )}
              </div>
            </CardFooter>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default StudentMainForm;
