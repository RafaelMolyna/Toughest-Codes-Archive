"use strict";
const input = require("fs").readFileSync("/dev/stdin", "utf8");
const lines = input.split("\n");

/**
 * Escreva a sua solução aqui
 * Code your solution here
 * Escriba su solución aquí
 */

lines.reverse();

// This problem is the Coin Change problem: given an amount of money m,
// and given an arr_coins list of coins, we must find the combination of coins that
// returns value of m with the minimun number of coins.

// The solution is based on two algorithms:
// the firs is dynamic programming, where, before find the solution
// for amount m, we find it for the amount 1, 2, 3 ... m-1,
// the second is a greed aproach, where, first, we decrease m by n times of the biggest
// coin available, when it is possible, which substantially reduces the time of sotution
// for big values of m

// function to solve the problem with greed algorithm
// although it is not the solution, it provides a good comparison value,
// being a fast solution for some simple cases:

var biggest_coin_used = 1;

function greed_coin(value) {
  let one_coin_used = true;
  let min_coins = 0;
  for (let j = 0; j < num_coins; j++) {
    min_coins += Math.floor(value / arr_coins[j]);
    value %= arr_coins[j];
    if (value === 0) {
      if (one_coin_used) {
        biggest_coin_used = arr_coins[j];
      }
      break;
    }
    if (min_coins) {
      one_coin_used = false;
    }
  }
  return min_coins;
}

// Aux funtion of the find_next function:
// find next coing change value of the sequence arr_changes

function chose_best_combination(temp, index, arr_changes) {
  // try all the combinations amount - coin(j), for every j that coins don't transpass amount
  let amount = index + 1;
  let best_poss_sol = Math.ceil(amount / biggest_coin_used);

  for (let j = num_coins - 1; j >= 0; j--) {
    let iteration = 0;
    let coin = arr_coins[j];

    // STOP CONDITION 2 (covers S.C. 1): when solution is multiple of the highest coin that fits the amount.
    if (temp === best_poss_sol) {
      return temp;
    }
    // since it starts by the smallest coins, if coin >= amount,
    // then it means that all possibilities was already tested, so it must stop,
    // othewise, it would try to access negatives positions of arr_changes, and therefore throw an error
    if (coin >= amount) {
      break;
    } else {
      iteration = arr_changes[index - coin] + 1;
    }

    if (iteration < temp) {
      temp = iteration;
    }
  }
  return temp;
}

// The solution of the problem is based on dynamic programming,
// thus, find_next must find the next element of arr_changes

function find_next(arr_changes, index) {
  // this function supposes the array already have the previous elements

  let amount = index + 1;

  // STOP CONDITION 1: Deprecated
  // test the minimum case by greed_coin: one or two coins found
  // obs: greed_coin always takes the case "one coin case", and sometimes take the two coins case too
  // if that happens, its the best local solution
  let temp = greed_coin(amount);
  temp = Math.min(temp, arr_changes[index - 1] + 1); // OPTIONAL LINE

  return chose_best_combination(temp, index, arr_changes); // + greed_chunk;
}

// dynamic_construction delivers the solution
// first it shirink m by using a greed aproach until a safe value
// later it uses dinamic constrution for solving the problem.

function dynamic_construction(length) {
  // works as STOP CONDITION and security border case:
  // Case "one_or_two" coins: greed_coin function covers it.
  if (num_coins <= 2) {
    return greed_coin(length);
  }

  // GREED APPROACH: let's remove excessive amount first:
  let big1 = arr_coins[0];
  let big2 = arr_coins[1];
  let num_divisions = Math.floor(length / big1);
  let remainder = length % big1;
  let greed_chunk = num_divisions - (big1 - Math.min(remainder, big2)) - 1; // chunk to be removed
  //console.log(greed_chunk, remainder, big1, big2);
  if (greed_chunk > 0) {
    length -= greed_chunk * big1;
  } else {
    greed_chunk = 0;
  }

  if (length === 0) return greed_chunk;

  // Start to create and fill the array:
  var arr_changes = Array(length).fill(0);
  arr_changes[0] = 1;
  for (let i = 1; i < length; i++) {
    // arr_changes[i] is equal to the coins of (i+1) amount
    arr_changes[i] = find_next(arr_changes, i);
  }
  return arr_changes[length - 1] + greed_chunk;
}

//MAIN

var n_inst = +lines.pop();
var output = "";
for (let i = 0; i < n_inst; i++) {
  var [num_coins, m] = lines
    .pop()
    .split(" ")
    .map((str) => +str);
  var arr_coins = lines
    .pop()
    .split(" ")
    .map((str) => +str)
    .sort((a, b) => b - a);
  let min_coins = dynamic_construction(m);
  output += min_coins + "\n";
}

process.stdout.write(output);
