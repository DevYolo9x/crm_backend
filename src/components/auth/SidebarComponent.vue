<template>
  <PageComponent>
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-4 lg:gap-4"
    >
      <div class="grid-cols-1 shadow-lg">
        <h1
          class="text-lg font-extrabold tracking-normal text-center w-full py-5 uppercase"
        >
          NGuyễn văn quyền
        </h1>
        <div class="nav">
          <ul class="flex flex-col">
            <li
              v-for="item in navigationLeft"
              :key="item.name"
              :class="[
                this.$route.name === item.to.name ? 'bg-pink' : '',
                'w-full flex justify-items-center gap-5 px-10 py-3',
              ]"
            >
              <img
                :class="[
                  this.$route.name === item.to.name
                    ? 'brightness-0 invert'
                    : '',
                ]"
                :src="item.src"
                :alt="item.name"
              />
              <router-link
                :to="item.to.href"
                :class="[
                  this.$route.name === item.to.name ? 'text-white' : '',
                  'font-normal',
                ]"
              >
                {{ item.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-span-3">
        <slot></slot>
      </div>
    </div>
  </PageComponent>
</template>
<script setup>
import PageComponent from "../../components/PageComponent.vue";
const navigationLeft = [
  {
    name: "Account Information",
    src: "../../src/assets/images/Group-1.svg",
    to: { href: "information", name: "Information" },
  },
  {
    name: "Address Book",
    src: "../../src/assets/images/Group-2.svg",
    to: { href: "address", name: "Address" },
  },
  {
    name: "My Orders",
    src: "../../src/assets/images/Group-3.svg",
    to: { href: "orders", name: "Orders" },
  },
  {
    name: "My Favorites",
    src: "../../src/assets/images/Group-4.svg",
    to: { href: "favorites", name: "Favorites" },
  },
];
</script>
