import React, { useState } from 'react';
import { FaSearch, FaFilter, FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    rooms: '',
    priceMin: '',
    priceMax: '',
  });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch({ ...filters, search: query });
  };

  const handleFilterSubmit = () => {
    onSearch({ ...filters, search: searchQuery });
    setShowFilter(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm p-4 z-10">
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        <div className="flex-1 flex items-center bg-gray-50 rounded-full px-4 py-2">
          <FaSearch className="text-[#2563EB] mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Поиск"
            className="bg-transparent w-full outline-none"
          />
        </div>
        <button 
          className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"
          onClick={() => setShowFilter(!showFilter)}
        >
          <FaFilter className="text-[#2563EB]" />
        </button>
        <button
          className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"
          onClick={() => setShowMenu(!showMenu)}
        >
          <FaBars className="text-[#2563EB]" />
        </button>
      </div>

      {/* Фильтр */}
      {showFilter && (
        <div className="absolute left-0 right-0 top-16 bg-white shadow-lg p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Количество комнат</label>
              <select
                value={filters.rooms}
                onChange={(e) => setFilters({ ...filters, rooms: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Все</option>
                <option value="1">1 комната</option>
                <option value="2">2 комнаты</option>
                <option value="3">3 комнаты</option>
                <option value="4+">4+ комнат</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Цена от</label>
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Цена до</label>
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="1000000"
                />
              </div>
            </div>
            <button
              onClick={handleFilterSubmit}
              className="w-full bg-[#2563EB] text-white py-2 rounded-lg hover:bg-opacity-90"
            >
              Применить
            </button>
          </div>
        </div>
      )}

      {/* Меню */}
      {showMenu && (
        <div className="absolute right-4 top-16 bg-white shadow-lg rounded-xl p-2 w-48">
          <button 
            onClick={() => navigate('/profile')}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg"
          >
            Личный кабинет
          </button>
          <button 
            onClick={() => navigate('/favorites')}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg"
          >
            Избранное
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 