import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import Modal from '../../components/Modal';

import confirmacao from '../../assets/Vector.svg';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('/foods');

      if (response.status === 200) {
        setFoods(response.data);
      }
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const newFood = {
        id: foods[foods.length - 1] ? foods[foods.length - 1].id + 1 : 1,
        name: food.name,
        description: food.description,
        price: food.price,
        available: true,
        image: food.image,
      }
      await api.post('/foods', newFood);
      setFoods([...foods, newFood]);
      setConfirmation(!confirmation);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const newFoodList = foods.map(currentFood => {
      if (currentFood.id !== editingFood.id) {
        return currentFood;
      }
      return {
        ...food,
        id: editingFood.id,
        available: editingFood.available,
      };
    });
    setFoods(newFoodList);
    await api.put(`foods/${editingFood.id}`, {
      ...food,
      id: editingFood.id,
      available: editingFood.available,
    });
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);
    const newFoodList = foods.filter(currentFood => currentFood.id !== id);
    setFoods(newFoodList);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  function toggleConfirmacao(): void {
    setConfirmation(!confirmation)
  }

  return (
    <>
      <Header openModal={toggleModal} />

      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>

      <Modal
        isOpen={confirmation}
        setIsOpen={toggleConfirmacao}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', justifyItems: 'center'
        }}>
          <img src={confirmacao} alt="conformação" style={{
            left: '7.81%',
            right: '7.81%',
            top: '7.81%',
            bottom: '7.81%',
          }} />
          <p style={{
            left: '0px',
            top: '72px',
            fontFamily: 'Roboto',
            fontStyle: 'normal',
            fontWeight: 'bold',
            fontSize: '24px',
            lineHeight: '28px',
            color: '#00000',
            textAlign: 'center'
          }}>
            Prato adicionado!
          </p>
        </div>
      </Modal>
    </>
  );
};

export default Dashboard;
