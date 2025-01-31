"use strict";

/**
 * offer controller
 */

// @ts-ignore
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

// @ts-ignore
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::offer.offer", ({ strapi }) => ({
  async deleteAll(ctx) {
    try {
      const idUser = ctx.state.user.id;
      // console.log(idUser); // 1
      const requestingUser = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        idUser,
        { populate: ["offers"] }
      );
      // console.log(requestingUser); // obj avec clé "offers" dont valeur est tableau d'obj
      // console.log(requestingUser.offers);  // tab d'objets "offers"
      for (let i = 0; i < requestingUser.offers.length; i++) {
        // console.log(requestingUser.offers[i]);  // obj offers 1 puis obj offers 10  puis obj offers
        const idOfferToDelete = requestingUser.offers[i].id;
        // console.log(idOfferToDelete); // 1 puis 10  puis 11
        const offersToDelete = await strapi.entityService.delete(
          "api::offer.offer",
          idOfferToDelete
        );
      }

      return { message: "All your offers have been deleted" };
    } catch (error) {
      ctx.response.status = 500;
      return { message: error.message };
    }
  },
  async create(ctx) {
    try {
      const idUser = ctx.state.user.id;
      // console.log(idUser); // 1
      const bodyRequest = ctx.request.body.data;
      // console.log(bodyRequest); // body sous forme de string
      const bodyObj = JSON.parse(bodyRequest);
      // console.log(bodyObj); // body sous forme d'objet
      // console.log(bodyObj.owner); // 2
      const idOwner = bodyObj.owner;
      if (idUser !== idOwner) {
        ctx.response.status = 403;
        return { message: "It's forbidden" };
      }
      const { data, meta } = await super.create(ctx);
      return { data, meta };
    } catch (error) {
      ctx.response.status = 500;
      return { message: error.message };
    }
  },
  async buy(ctx) {
    try {
      const { status } = await stripe.charges.create({
        amount: ctx.request.body.amount * 100,
        currency: "eur",
        description: `Paiement my-project Leboncoin pour : ${ctx.request.body.title}`,
        source: ctx.request.body.token,
      });
      console.log(ctx.request.body);

      return { status: status };
    } catch (error) {
      console.log("Controller error catch>>>", error);

      ctx.request.status = 500;
      return { message: error.message };
    }
  },
}));
