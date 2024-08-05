"use client";

import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import Image from "next/image";
import { useState, useEffect } from "react";
import {firestore} from '@/firebase'
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, query } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: "" });
  const [search, setSearch] = useState("");

  const updateItems = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name:doc.id,
        ...doc.data()
      });
    });
    setInventory(inventoryList);
  }

  const removeItem = async (item) => {
    const docRef = doc(firestore, "inventory", item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {quantity: quantity - 1});
      }
    }

    await updateItems();
  }

  const addItem = async (item) => {
    const docRef = doc(firestore, "inventory", item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      await setDoc(docRef, {quantity: quantity + 1});
    }
    // else add the new iteam with the given quantity
    else {
      await setDoc(docRef, {quantity: newItem.quantity});
    }

    await updateItems();
  }

  useEffect(() => {
    updateItems();
  }, []);

  const searchItems = (search) => {
    if (search === "") {
      updateItems();
      // setInventory([
      //   { name: "Apple", quantity: 5 },
      //   { name: "Banana", quantity: 3 },
      //   { name: "Orange", quantity: 7 },
      //   { name: "Grapes", quantity: 2 },
      //   { name: "Pineapple", quantity: 1 },
      // ]);
    } else {
      console.log(search);
      setInventory(inventory.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())));
    }
  }

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const showInput = () => {
    console.log(newItem);
    console.log(inventory);
  }

  return (
    <Box 
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
    >
      <Typography variant="h3">
        Pantry Tracker
      </Typography>
      
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid black"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)"
          }}
        >
          <Typography variant="h5">Add Item</Typography>

          <Stack width="100%" direction="row" justifyContent="space-between" spacing={2}>
            <Box width="75%">
              <TextField
                width="60%"
                label="Item"
                variant="outlined"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </Box>
            <Box width="35%">
              <TextField
                width="25%"
                label="Quantity"
                variant="outlined"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              />
            </Box>
          </Stack>

          <Button onClick={() => {
            addItem(newItem.name)
            // showInput();
            setNewItem({ name: "", quantity: "" });
            handleClose();
          }}>
            Add
          </Button>
        </Box>
      </Modal>

      <Box border="1px solid #333" margin={5}>
        <Box
          bgcolor="#ADD8E6"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          padding={3}
        >
          <Stack width="100%" direction="row" justifyContent="space-between" spacing={2}>
            <Box width="90%">
              <TextField
                    fullWidth
                    label="Search"
                    variant="outlined"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      searchItems(e.target.value);
                    }}
                  />
            </Box>
            <Box width="10%" padding={1}>
              <Button onClick={handleOpen}>Add</Button>
            </Box>
          </Stack>

        </Box>
      
      <Stack width="800px" height="300px" spacing={2} overflow="auto">
        { inventory.map((item) => (
          <Box 
            key={item.name}
            width="100%"
            height="50px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding={5}
          >
            <Typography variant="h5">{item.name}</Typography>
            <Typography variant="h5">{item.quantity}</Typography>
            <Stack direction="row" spacing={2}>
            <Button
                variant="contained"
                onClick={() => {
                  addItem(item.name)
                }}
              >
                Add
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  removeItem(item.name)
                }}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>

    </Box>
    </Box>
  );
}
