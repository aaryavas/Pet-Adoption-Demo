import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import petMainImage from '../assets/pet-main.jpg'; 
import pet2Image from '../assets/pet-2.jpeg'; 
import pet3Image from '../assets/pet-3.jpg';

function Home() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const displayName = username;

  const handleButtonClick = async () => {
    try {
      navigate('/pets');
    } catch (error) {
      console.error('Error navigating to pets page:', error);
    }
  };

  const petImages = [
    { src: petMainImage, alt: 'A cat representing pets available for adoption' },
    { src: pet2Image, alt: 'A dog representing pets available for adoption' },
    { src: pet3Image, alt: 'A kitten representing pets available for adoption' },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === petImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [petImages.length]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      paddingTop: '80px',
      minHeight: '100vh',
      backgroundColor: '#fefefe',
      textAlign: 'center',
    }}>
      {displayName && (
        <div style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          backgroundColor: '#f0f8ff',
          padding: '0.5rem 1rem',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Hello, <strong>{displayName}</strong>!
        </div>
      )}
      <h1 style={{ fontSize: '2.5rem' }}>
        Welcome to Our Pet Adoption Page!
      </h1>
      <p style={{ fontSize: '1.2rem' }}>
        Find your forever friend today!
      </p>
      <button 
        style={{
          padding: '0.6em 1.2em',
          fontSize: '1em',
          backgroundColor: '#646cff',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
        onClick={handleButtonClick}
      >
        Our Pets Here!
      </button>

      <div style={{ 
        width: '80%', 
        maxWidth: '800px',
        position: 'relative',
        height: '400px',
        overflow: 'hidden'
      }}>
        {petImages.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            style={{
              width: '100%',
              borderRadius: '8px',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: index === currentImageIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: index === currentImageIndex ? 1 : 0
              
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;