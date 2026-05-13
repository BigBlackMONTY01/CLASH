import React, { useState, useEffect } from 'react';
import './CardCollection.css';
import axios from 'axios';

const CardCollection = () => {
  const [cards, setCards] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get(`/api/cards/collection/USER_ID`); // Replace USER_ID dynamically
        setCards(response.data);
      } catch (error) {
        console.error('Error fetching cards:', error);
      }
    };
    fetchCards();
  }, []);

  const filteredCards = cards.filter(card => filter === 'all' || card.rarity === filter);

  return (
    <div className="card-collection">
      <div className="filters">
        <select onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="common">Common</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
        </select>
      </div>
      <div className="grid">
        {filteredCards.map((card) => (
          <div key={card.id} className={`card ${card.rarity.toLowerCase()}`}>
            <h3>{card.opponent_name}</h3>
            <p>Topic: {card.topic}</p>
            <p>Score: {card.final_score}</p>
            <p>Rarity: {card.rarity}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardCollection;