# Fuzzy Time Series (FTS)
Fuzzy time series using typescript engine

# Background
I'm trying to explain about Fuzzy Time Series from another viewpoint that easier to be understand with step-by-step explanation.

See [here](https://towardsdatascience.com/a-short-tutorial-on-fuzzy-time-series-dcc6d4eb1b15) to see original articles.

# How does it works?

## Short Explanation

Fuzzy Time Series (FTS) is an expansion of fuzzy logic but now used on time-series data. The idea itself was to forecast the next value of a time-dependant series of data (mostly numbers) if we know previous value using fuzzy logic. The steps itself was divided into separate section as defined below.

a. Training
  1. Defining Unviserse of Discourse
  2. Create Linguistic Variable
  3. Fuzzyfication
  4. Creating Temporal patterns
  5. Creating the rules.

b. Forecasting
    
## Training

To begin forecasting, we must first build the forecasting model first. The forecasting model is responsible for forecasting which value that might come after series of time-dependant value was given. Here we will require a time-dependant series of data (dataset). This explanation will use [this dataset](https://gist.github.com/petroniocandido/b53e793cb47bb16a44f61f7e44dbda4e/raw/0a86f85f2ced73963765219a2e2f3df2b9248adc/enrollments.csv) to begin with.

### 1. Defining Universe of Discourse

Take a look at dataset first. We had a series of number, and of course the number: sometimes it going big but sometimes it may fall on next time ticks. We want to forecast what's value will come out next. But here's the problem: Will the next number be higher than any values on our dataset or lower than any values on our dataset? We still doesn't know if the next value forecasted will be 0, a very big number like infinity, or the worst: a very big negative infinity. We don't want our model becoming too complex so it could handle most impossible (but never 0% probabilities) numbers like infinities. That's why we had to define Universe of Discourse (in layman terms, maximum and minimum possible values that we can forecast). We could pick any numbers for our Universe of Discourse, but of course picking the right number will enhance our forecast results (There may be some research about this). As a starting point, let's say our minimum possible values were the lowest number that appeared on our dataset and maximum possible values were the highest number that appeared on our dataset defined as below.

```
U = [min(dataset), max(dataset)]
U = [13055, 19337]
```

But, wait. How if our forecast returns value beyond our Universe? Now you understand the problem of Defining Universe of Discourse: the probabilities of this happening is not 0, so we had to add some safe-handle. Let's add an extra margin of 10% to both minimum possible values and maximum possible values so our Universe of Discours will be changed as below.

```
U = [min(dataset), max(dataset)]
U = [13055, 19337]
// Subtract min value by 10% and Add max value by 10%
U = [13055 - 1305.5, 19337 + 1933.7]
U = [11749.5, 21270.7]
```

### 2. Create Linguistic Variable

Now we had the Universe on our hand. It's time to divide them into several *overlapped* intervals called partition. Why? because we want to apply fuzzy logic to them! Go back to your fuzzy logic class to see why we need to use an overlapped intervals.

Okay, but how do we create them? How much? How big does one partitions will be? There are a lot more research tries to giving a best method to do partitioning. For now, we'll do the simplest one: divide them into *n* partitions with same fixed size. This was a vital parts when dealing with Fuzzy Time Series as the accurracy depends on how you create the partition.

Let's say we want to create about 10 partitions from our Universe `U`. We'll do a simple partitioning and apply a triangle-curve of fuzzy membership function. If you were a math geek, you may define it with some nasty random characters that doesn't even make sense since you were not even telling what does the characters mean (sorry for being sarcastic) and make others vomit their lunch just because trying to understand what you've been type like this:

```
A1 = a11/U1 + a12/U2 + ... + a1n/Un
A2 = a21/U1 + a22/U2 + ... + a2n/Un
...
Am = am1/U1 + am2/U2 + ... + amn/Un
```

I know, math is just a misunderstands and a random characters but it will only applied if you don't define what the hell does the characters mean! Even dumb people won't understand what is `Un` means wherease the essence of reading is to make even dumb people to understand so please, **Do Note What Your Variable Means O' dear math peoples**!

Okay, I won't explain much about the math since I got so much examples on journal on my country doesn't even make sense for a non-math people that could cause more abruption of misunderstanding. Let's make them simple like this.

```
U = [11749.5, 21270.7]
Interval = 21270.7 - 11749.5 = 9521.2
Number of partition as n = 10
Interval per Partition = Interval / n = 952.12
--- Repeat
Partition [i]
    Start point: (if i is 0) then (0) else (Highest membership value Partition [i - 1])
    Highest membership value: (if i is 0) then (minimum value in U) else (End value in Partition [i - 1])
    End point: ((if i is 0) then (minimum value in U) else (End value in Partition [i - 1])) + Interval per Partition
--- Until End value reached maximum possible number in our Unverse U
Partition [0]
    Start point: 0
    Highest membership value: 11749.5
    End point: 12701.62
Partition [1]
    Start point: 11749.5
    Highest membership value: 12701.62
    End point: 13653.74
Partition [2]
    Start point: 12701.62
    Highest membership value: 13653.74
    End point: 14605.86
Partition [3]
    Start point: 13653.74
    Highest membership value: 14605.86
    End point: 15557.98
Partition [4]
    Start point: 14605.86
    Highest membership value: 15557.98
    End point: 16510.1
Partition [5]
    Start point: 15557.98
    Highest membership value: 16510.1
    End point: 17462.22
Partition [6]
    Start point: 16510.1
    Highest membership value: 17462.22
    End point: 18414.34
Partition [7]
    Start point: 17462.22
    Highest membership value: 18414.34
    End point: 19366.46
Partition [8]
    Start point: 18414.34
    Highest membership value: 19366.46
    End point: 20318.58
Partition [9]
    Start point: 19366.46
    Highest membership value: 20318.58
    End point: 21270.7
```

The explained partition is equal with your geek math formula like you were denoting `m` and `n` as 9 and starting both `m` and `n` from 0. I won't explain further about the math behind the partition formula: let those who gave that geek math formula at first to explain (or anyone who understand better in that math that could explain the partition formula even to a 6-year old child). You could also see the graphic reference of the partition that we've defined in [here](https://miro.medium.com/max/700/1*s-jSQqFnQYJGqy_cnRRBzA.png)

### 3. Fuzzyfication

Now this parts were getting interested. We'll do fuzzyfication on our dataset. In layman terms, we'll apply the dataset and fit them into our partition. But how?

Take a look deeper to our Partition: we had 3 properties in there. These properties were actually a fuzzy logic properties for our models (Remember: here we using a triangular curves variant). Let's make it simple:

```
Inside every partition:
    let denote partition start point as a,
    let denote partition highest membership value as b,
    let denote partition end point as c,
    
    partition's membership value using triangular curve will be defined as
        with input value as x,
            membership value = {
                0, if x <= a or x >= c
                (x - a) / (b - a), if a < x and x <= b
                (c - x) / (c - b), if b < x and x <= c
            }
```

Now, we had to find out which partitions were each data belongs to using the partition's membership value.

```
In year 1971, the value was 13055, so let denote x = 13055
    In Partition [0]:
        a = 0
        b = 11749.5
        c = 12701.62
        x >= c, so 0
    In Partition [1]: 
        a = 11749.5
        b = 12701.62
        c = 13653.74
        b < x and x <= c, so (c - x) / (c - b) = 0.6288493047094909
    In Partition [2]
        a = 12701.62
        b = 13653.74
        c = 14605.86
        a < x and x <= b, so (x - a) / (b - a) = 0.37115069529050915
    In Partition [3]
        a =  13653.74
        b =  14605.86
        c =  15557.98
        x <= a, so 0
    In Partition [4]
        a =  14605.86
        b =  15557.98
        c =  16510.1
        x <= a, so 0
    In Partition [5]
        a =  15557.98
        b =  16510.1
        c =  17462.22
        x <= a, so 0
    In Partition [6]
        a =  16510.1
        b =  17462.22
        c =  18414.34
        x <= a, so 0
    In Partition [7]
        a =  17462.22
        b =  18414.34
        c =  19366.46
        x <= a, so 0
    In Partition [8]
        a =  18414.34
        b =  19366.46
        c =  20318.58
        x <= a, so 0
    In Partition [9]
        a =  19366.46
        b =  20318.58
        c =  21270.7
        x <= a, so 0
    Max membership was reached in Partition [1], so year 1971 fir in Partition [1]
In year 1972, the value was 13055, so let denote x = 13563
    In Partition [0]:
        a = 0
        b = 11749.5
        c = 12701.62
        x >= c, so 0
    In Partition [1]: 
        a = 11749.5
        b = 12701.62
        c = 13653.74
        b < x and x <= c, so (c - x) / (c - b) = 0.09530311305297638
    In Partition [2]
        a = 12701.62
        b = 13653.74
        c = 14605.86
        a < x and x <= b, so (x - a) / (b - a) = 0.9046968869470237
    In Partition [3]
        a =  13653.74
        b =  14605.86
        c =  15557.98
        x <= a, so 0
    In Partition [4]
        a =  14605.86
        b =  15557.98
        c =  16510.1
        x <= a, so 0
    In Partition [5]
        a =  15557.98
        b =  16510.1
        c =  17462.22
        x <= a, so 0
    In Partition [6]
        a =  16510.1
        b =  17462.22
        c =  18414.34
        x <= a, so 0
    In Partition [7]
        a =  17462.22
        b =  18414.34
        c =  19366.46
        x <= a, so 0
    In Partition [8]
        a =  18414.34
        b =  19366.46
        c =  20318.58
        x <= a, so 0
    In Partition [9]
        a =  19366.46
        b =  20318.58
        c =  21270.7
        x <= a, so 0
    Max membership was reached in Partition [2], so year 1972 fir in Partition [2]

...
Keep the works
...

You'll got this result:
Year 1971: Partition [1]
Year 1972: Partition [2]
Year 1973: Partition [2]
Year 1974: Partition [3]
Year 1975: Partition [4]
Year 1976: Partition [4]
Year 1977: Partition [4]
Year 1978: Partition [4]
Year 1979: Partition [5]
Year 1980: Partition [5]
Year 1981: Partition [5]
Year 1982: Partition [4]
Year 1983: Partition [4]
Year 1984: Partition [4]
Year 1985: Partition [4]
Year 1986: Partition [4]
Year 1987: Partition [5]
Year 1988: Partition [7]
Year 1989: Partition [8]
Year 1990: Partition [8]
Year 1991: Partition [8]
Year 1992: Partition [7]
        
```

### 4. Creating Temporal Patterns

Now we had the Partition and fit our dataset and return somewhat time-dependant partition. If you look closely, you'll see that the partition now seems following some pattern compared to years. Let's extract them.

```
By following year in sequential order, we'll find the pattern that:
Precedent     => Consequent
Partition [1] => Partition [2]
Partition [2] => Partition [2]
Partition [2] => Partition [3]
Partition [3] => Partition [4]
Partition [4] => Partition [4]
Partition [4] => Partition [4]
Partition [4] => Partition [4]
Partition [4] => Partition [5]
Partition [5] => Partition [5]
Partition [5] => Partition [5]
Partition [5] => Partition [4]
Partition [4] => Partition [4]
Partition [4] => Partition [4]
Partition [4] => Partition [4]
Partition [4] => Partition [4]
Partition [4] => Partition [5]
Partition [5] => Partition [7]
Partition [7] => Partition [8]
Partition [8] => Partition [8]
Partition [8] => Partition [8]
Partition [8] => Partition [7]
```

### 5. Creating the rules

We've got the patterns! Now we'll build the rules from the temporal patterns by grouping them by `Precedent`.

```
From Partition [0], It doesn't go anywhere
From Partition [1], it can go to Partition [2]
From Partition [2], it can go to Partition [2], Partition [3]
From Partition [3], it can go to Partition [4]
From Partition [4], it can go to Partition [4], Partition [5]
From Partition [5], it can go to Partition [4], Partition [5], Partition [7]
From Partition [6], it doesn't go anywhere
From Partition [7], it can go to Partition [8]
From Partition [8], it can go to Partition [7], Partition [8]
From Partition [9], it doesn't go anywhere
```

## Forecasting

We've already build the rule: that's the FTS model! It's time to forecasting. There are a few rules that need to be considered during forecasting defined as below.
- If the forecast from our rule indicated that the partition doesn't go anywhere (0 Consequent), that mean's the forecast value were the highest membership value of value's partition. For our cases that means Partition [0], Partiton [6], and Partition [9].
- If the forecast from our rule indicated that the partition only goes to single partition, that mean's we use the forecasted partition highest membership value. For our cases that means Partition [1], Partiton [3], and Partition [7].
- If the forecast from our rule indicated that the partition goes to multiple partitions, that mean's we use the average of forecasted partition highest membership values.

For this time, we'll gonna forecast all of our dataset using the rules we've generated.

```
In year 1971, the value was 13055, so let denote x = 13055
    In Partition [0]:
        a = 0
        b = 11749.5
        c = 12701.62
        x >= c, so 0
    In Partition [1]: 
        a = 11749.5
        b = 12701.62
        c = 13653.74
        b < x and x <= c, so (c - x) / (c - b) = 0.6288493047094909
    In Partition [2]
        a = 12701.62
        b = 13653.74
        c = 14605.86
        a < x and x <= b, so (x - a) / (b - a) = 0.37115069529050915
    In Partition [3]
        a =  13653.74
        b =  14605.86
        c =  15557.98
        x <= a, so 0
    In Partition [4]
        a =  14605.86
        b =  15557.98
        c =  16510.1
        x <= a, so 0
    In Partition [5]
        a =  15557.98
        b =  16510.1
        c =  17462.22
        x <= a, so 0
    In Partition [6]
        a =  16510.1
        b =  17462.22
        c =  18414.34
        x <= a, so 0
    In Partition [7]
        a =  17462.22
        b =  18414.34
        c =  19366.46
        x <= a, so 0
    In Partition [8]
        a =  18414.34
        b =  19366.46
        c =  20318.58
        x <= a, so 0
    In Partition [9]
        a =  19366.46
        b =  20318.58
        c =  21270.7
        x <= a, so 0
    Max membership was reached in Partition [1], so year 1971 fir in Partition [1]
    Using the rules, the forecasted Partition will be Partition [2], therefore the forecasted values will be 13653.74
In year 1972, the value was 13055, so let denote x = 13563
    In Partition [0]:
        a = 0
        b = 11749.5
        c = 12701.62
        x >= c, so 0
    In Partition [1]: 
        a = 11749.5
        b = 12701.62
        c = 13653.74
        b < x and x <= c, so (c - x) / (c - b) = 0.09530311305297638
    In Partition [2]
        a = 12701.62
        b = 13653.74
        c = 14605.86
        a < x and x <= b, so (x - a) / (b - a) = 0.9046968869470237
    In Partition [3]
        a =  13653.74
        b =  14605.86
        c =  15557.98
        x <= a, so 0
    In Partition [4]
        a =  14605.86
        b =  15557.98
        c =  16510.1
        x <= a, so 0
    In Partition [5]
        a =  15557.98
        b =  16510.1
        c =  17462.22
        x <= a, so 0
    In Partition [6]
        a =  16510.1
        b =  17462.22
        c =  18414.34
        x <= a, so 0
    In Partition [7]
        a =  17462.22
        b =  18414.34
        c =  19366.46
        x <= a, so 0
    In Partition [8]
        a =  18414.34
        b =  19366.46
        c =  20318.58
        x <= a, so 0
    In Partition [9]
        a =  19366.46
        b =  20318.58
        c =  21270.7
        x <= a, so 0
    Max membership was reached in Partition [2], so year 1972 fir in Partition [2]
    Using the rules, the forecasted Partition will be Partition [2] or Partition [3], therefore the forecasted values will be (13653.74 + 14605.86) / 2 = 14129.8
...
Keep the works
...

You'll got this result:
┌──────┬───────┬────────────────────┐
│ Year │ value │      forecast      │
├──────┼───────┼────────────────────┤
│ 1971 │ 13055 │      13653.74      │
│ 1973 │ 13867 │      14129.8       │
│ 1974 │ 14696 │      15557.98      │
│ 1975 │ 15460 │ 16034.039999999999 │
│ 1976 │ 15311 │ 16034.039999999999 │
│ 1977 │ 15603 │ 16034.039999999999 │
│ 1978 │ 15861 │ 16034.039999999999 │
│ 1979 │ 16807 │ 16827.47333333333  │
│ 1980 │ 16919 │ 16827.47333333333  │
│ 1981 │ 16388 │ 16827.47333333333  │
│ 1982 │ 15433 │ 16034.039999999999 │
│ 1983 │ 15497 │ 16034.039999999999 │
│ 1984 │ 15145 │ 16034.039999999999 │
│ 1985 │ 15163 │ 16034.039999999999 │
│ 1986 │ 15984 │ 16034.039999999999 │
│ 1987 │ 16859 │ 16827.47333333333  │
│ 1988 │ 18150 │      19366.46      │
│ 1989 │ 18970 │      18890.4       │
│ 1990 │ 19328 │      18890.4       │
│ 1991 │ 19337 │      18890.4       │
│ 1992 │ 18876 │      19366.46      │
└──────┴───────┴────────────────────┘
```
