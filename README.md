# LendingClub
## Visualization on Kaggle Lending Club data

### Goal :
Apply dc.js visualization as described in http://adilmoujahid.com/posts/2015/01/interactive-data-visualization-d3-dc-python-mongodb/ to a new set of data

### Data :
[Kaggle Lending Club loan data](https://www.kaggle.com/wendykan/lending-club-loan-data)

The *loan.csv* file needs to be imported in mongodb running the following command in order to be able to use the code as is :
```
mongoimport -d lendingclub -c loans --type csv --file loan.csv --headerline
```

