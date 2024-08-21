/**
 * Utilizzo di un modulo esterno per la gestione delle persone, ovvero qua abbiamo tutti le 
 * route per gestire /api/persone, difatti abbiamo lasciato solo / o /:id
 * Poi esportiamo il modulo router. Attenzione che qua usiamo route.get ecc e non app perchè sono 
 * due cose separate
 */

const express = require('express');
const router = express.Router();
const {persone} = require('../persone');

router.get('/', (req, res) => {
    res.status(200).json({success: true, data: persone});
});

router.get('/:id', (req, res) => {
    res.status(200).json({success: true, data: persone[req.params.id]});
});

router.post('/', (req, res) => {
    console.log(req.body);
    const persona = req.body;
    persone.push(persona);
    res.status(201).json({success: true, data: persone});
});

router.put('/:id', (req, res) => {
    const {id} = req.params;
    const persona = req.body;
    persone[Number(id) - 1] = persona;
    res.status(200).json({success: true, data: persone});
});

router.delete('/:id', (req, res) => {
    const {id} = req.params;
    const perElim = persone.findIndex(persona => persona.id === id);
    persone.splice(perElim, 1);
    res.status(200).json({success: true, data: persone});
});

module.exports = router;