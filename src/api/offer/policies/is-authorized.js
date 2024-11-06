module.exports = async (policyContext, config, { strapi }) => {
  const userId = policyContext.state.user.id;
  //   console.log(userId); // 1
  const offerId = policyContext.request.params.id;
  //   console.log(offerId); // 17
  const offer = await strapi.entityService.findOne(
    "api::offer.offer",
    offerId,
    { populate: ["owner"] }
  );
  //   console.log(offer); // obj avec cle "owner" dont valeur est obj avec cle id
  //   console.log(offer.owner.id); //  1
  const offerOwnerId = offer.owner.id;
  if (userId !== offerOwnerId) {
    return false;
  } else {
    return true;
  }
};
