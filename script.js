fetch('JSON Dashboard/summary.json')
  .then(response => response.json())
  .then(data => {
    const years = [...new Set(data.map(item => item.Year))];
    const revenue = data.map(item => ({ year: item.Year, value: parseInt(item.total_Revenue) }));
    const profit = data.map(item => ({ year: item.Year, value: parseInt(item.total_Profit) }));
    const cost = data.map(item => ({ year: item.Year, value: parseInt(item.total_Cost) }));

    const yearFilter = document.getElementById('year-filter');
    years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });
    const ctx = document.getElementById('linechart').getContext('2d');
    const chartConfig = {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Revenue',
            borderColor: '#f66d00',
            data: revenue.map(item => item.value),
            hidden: false
          },
          {
            label: 'Profit',
            borderColor: '#0072f0',
            data: profit.map(item => item.value),
            hidden: false
          },
          {
            label: 'Cost',
            borderColor: '#f10096',
            data: cost.map(item => item.value),
            hidden: false
          }
        ]
      },
      options: {
        responsive: true,
      }
    };
    const linechart = new Chart(ctx, chartConfig);

    document.querySelectorAll('.dropdown-content input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const dataset = chartConfig.data.datasets.find(ds => ds.label.toLowerCase() === this.value);
        dataset.hidden = !this.checked;
        linechart.update();
      });
    });

    yearFilter.addEventListener('change', function() {
      const selectedYears = Array.from(this.selectedOptions).map(option => option.value);
      if (selectedYears.includes('all')) {
        chartConfig.data.labels = years;
        chartConfig.data.datasets.forEach(dataset => {
          dataset.data = data.map(item => parseInt(item[`total_${dataset.label}`]));
        });
      } else {
        const filteredData = data.filter(item => selectedYears.includes(item.Year.toString()));
        chartConfig.data.labels = filteredData.map(item => item.Year);
        chartConfig.data.datasets.forEach(dataset => {
          dataset.data = filteredData.map(item => parseInt(item[`total_${dataset.label}`]));
        });
      }
      linechart.update();
    });
  })
  .catch(error => console.error(error));




  fetch('JSON Dashboard/revenue.json')
  .then(response => response.json())
  .then(data => {
    const countries = [...new Set(data.map(item => item.Country))];

    const countryFilter = document.getElementById('country-filter');
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countryFilter.appendChild(option);
    });

    const getRevenueData = (selectedCountries, category) => {
      return countries.map(country => {
        if (!selectedCountries.includes(country)) return 0;
        const countryData = data.filter(item => item.Country === country && item.Product_Category === category);
        return countryData.length > 0 ? parseInt(countryData[0].total_revenue) : 0;
      });
    };

    const ctx = document.getElementById('chart').getContext('2d');
    const chartConfig = {
      type: 'bar',
      data: {
        labels: countries,
        datasets: [
          {
            label: 'Bikes Revenue',
            data: getRevenueData(countries, 'Bikes'),
            backgroundColor: '#f66d00',
            hidden: false
          },
          {
            label: 'Accessories Revenue',
            data: getRevenueData(countries, 'Accessories'),
            backgroundColor: '#ffb300',
            hidden: false
          },
          {
            label: 'Clothing Revenue',
            data: getRevenueData(countries, 'Clothing'),
            backgroundColor: '#ffd54f',
            hidden: false
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => (value / 1e6).toFixed(1) + 'M',
            },
          },
          x: {},
        },
      },
    };
    const chart = new Chart(ctx, chartConfig);

    document.querySelectorAll('.dropdown-content input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', function () {
        const dataset = chartConfig.data.datasets.find(ds => ds.label.toLowerCase().includes(this.value));
        dataset.hidden = !this.checked;
        chart.update();
      });
    });

    countryFilter.addEventListener('change', function () {
      const selectedCountries = Array.from(this.selectedOptions).map(option => option.value);
      chartConfig.data.datasets.forEach(dataset => {
        const category = dataset.label.split(' ')[0];
        dataset.data = getRevenueData(selectedCountries, category);
      });
      chart.update();
    });
  })
  .catch(error => console.error(error));

  fetch('JSON Dashboard/agepie.json')
  .then(response => response.json())
  .then(data => {
    const ctx = document.getElementById('pie').getContext('2d');

    const ageGroups = data.map(item => item.Age_Group);
    const orderPercentages = data.map(item => item.order_percentage);

    const ageGroupFilters = document.getElementById('age-group-filters');
    ageGroups.forEach((ageGroup, index) => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = ageGroup;
      checkbox.checked = true;
      checkbox.id = `age-group-${index}`;
      checkbox.classList.add('age-group-checkbox');

      const label = document.createElement('label');
      label.htmlFor = `age-group-${index}`;
      label.textContent = ageGroup;

      ageGroupFilters.appendChild(checkbox);
      ageGroupFilters.appendChild(label);
    });

    const chartConfig = {
      type: 'doughnut',
      data: {
        labels: ageGroups,
        datasets: [{
          label: 'By Age',
          data: orderPercentages,
          backgroundColor: ['#0072f0', '#00b6cb', '#f10096', '#f66f03'],
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Total Revenue by Age Group'
          }
        }
      }
    };

    const chart = new Chart(ctx, chartConfig);

    document.querySelectorAll('.age-group-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function () {
        const selectedAgeGroups = Array.from(document.querySelectorAll('.age-group-checkbox:checked')).map(cb => cb.value);

        chartConfig.data.labels = selectedAgeGroups;
        chartConfig.data.datasets[0].data = selectedAgeGroups.map(ageGroup => {
          const ageGroupData = data.find(item => item.Age_Group === ageGroup);
          return ageGroupData ? ageGroupData.order_percentage : 0;
        });

        chart.update();
      });
    });
  })
  .catch(error => console.error(error));


  fetch('JSON Dashboard/mpq.json')
  .then(response => response.json())
  .then(data => {
    const productCategories = [...new Set(data.map(item => item.Product_Category))];

    const productCategoryFilters = document.getElementById('product-category-filters');
    productCategories.forEach((category, index) => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = category;
      checkbox.checked = true;
      checkbox.id = `category-${index}`;
      checkbox.classList.add('category-checkbox');

      const label = document.createElement('label');
      label.htmlFor = `category-${index}`;
      label.textContent = category;

      productCategoryFilters.appendChild(checkbox);
      productCategoryFilters.appendChild(label);
    });

    const tableBody = document.querySelector('#jtable tbody');

    const renderTable = (filteredData) => {
      tableBody.innerHTML = '';
      filteredData.forEach(row => {
        const tableRow = document.createElement('tr');
        for (const key in row) {
          const tableCell = document.createElement('td');
          tableCell.textContent = row[key];
          tableRow.appendChild(tableCell);
        }
        tableBody.appendChild(tableRow);
      });
    };

    // Initial render
    renderTable(data.slice(0, 7));

    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function () {
        const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(cb => cb.value);

        const filteredData = data.filter(item => selectedCategories.includes(item.Product_Category)).slice(0, 7);
        renderTable(filteredData);
      });
    });
  })
  .catch(error => console.error('Error fetching data:', error));

 fetch('JSON Dashboard/ke52.json')
        .then(response => response.json())
        .then(data => {
          const labels = data.map(item => item.Product);
          const dataSet = data.sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 10).map(item => item.total_revenue);
      
          const ctx = document.getElementById('miring').getContext('2d');
          const miring = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [{
                label: 'TOP_SELLING_PRODUCTS',
                data: dataSet,
                backgroundColor: [
                  '#f66d00',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              indexAxis: 'y', // <-- here
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        })



