import React, { useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import SearchBar from '../SearchBar';
import ApartmentCard from '../ApartmentCard';
import ApartmentDetail from './ApartmentDetail';
import KaspiPayment from '../KaspiPayment';
import FooterBar from '../FooterBar';
import { apartments } from '../../data/apartments';

const ClientSite = () => {
  const { siteId } = useParams();
  const [filteredApartments, setFilteredApartments] = useState(apartments);

  const handleSearch = (filters) => {
    let filtered = apartments;

    if (filters.search) {
      filtered = filtered.filter(apt => 
        apt.complex.toLowerCase().includes(filters.search.toLowerCase()) ||
        apt.rooms.toString().includes(filters.search)
      );
    }

    if (filters.rooms) {
      filtered = filtered.filter(apt => 
        filters.rooms === '4+' ? apt.rooms >= 4 : apt.rooms === parseInt(filters.rooms)
      );
    }

    if (filters.priceMin) {
      filtered = filtered.filter(apt => apt.price >= parseInt(filters.priceMin));
    }

    if (filters.priceMax) {
      filtered = filtered.filter(apt => apt.price <= parseInt(filters.priceMax));
    }

    setFilteredApartments(filtered);
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <div className="min-h-screen bg-gray-50">
            <SearchBar onSearch={handleSearch} />
            <div className="max-w-4xl mx-auto pt-20 pb-16 px-4">
              <div className="grid grid-cols-1 gap-4">
                {filteredApartments.map(apartment => (
                  <ApartmentCard key={apartment.id} apartment={apartment} />
                ))}
              </div>
            </div>
            <FooterBar />
          </div>
        } 
      />
      <Route path="apartment/:id" element={<ApartmentDetail />} />
      <Route path="payment" element={<KaspiPayment />} />
    </Routes>
  );
};

export default ClientSite; 