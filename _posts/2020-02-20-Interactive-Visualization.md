## Parallel coordinate plot

```
import plotly.express as px
import pandas as pd
df = pd.read_csv('sample.csv')
df.head()
```

```
         score  x1  x2  x3   x4  x5   x6   x7
0    9563996.0 NaN NaN NaN  1.0 NaN  1.0  1.0
1   32309930.0 NaN NaN NaN  1.0 NaN  1.0  2.0
2   69349280.0 NaN NaN NaN  1.0 NaN  1.0  3.0
3  120682000.0 NaN NaN NaN  1.0 NaN  1.0  4.0
4  186308200.0 NaN NaN NaN  1.0 NaN  1.0  5.0
```

Plot these data using parallel coordinate plot.  

```
fig = px.parallel_coordinates(df, color="score", 
                             color_continuous_scale=px.colors.diverging.Tealrose,
                             color_continuous_midpoint=2, height=600)
fig.show()
```

will produce the output

![coordinate-plot](/images/coord-plot.png)
