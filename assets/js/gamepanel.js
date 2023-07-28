const apiKey = 'key9kpLHqsdRFXvS2';
  const baseId = 'appaePimTt1Ji6hSr';
  const tableName = 'tblivWUpxtGbTszm3';

  fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?api_key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const listWidget = document.getElementById('list-widget');
      const ul = document.createElement('ul');
      ul.classList.add('button-list', 'horizontal');

      // Сортировка данных по полю "Num"
      data.records.sort((a, b) => a.fields.Num - b.fields.Num);

      data.records.forEach(record => {
        const fields = record.fields;
        const name = fields.Name;
        const imageUrl = fields.Image;
        const url = fields.URL;
        const power = fields.Power;

        const button = document.createElement('button');
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = name;
        button.appendChild(img);

        const span = document.createElement('span');
        span.innerText = name;
        span.classList.add('image-text');
        img.parentNode.insertBefore(span, img.nextSibling);

        const li = document.createElement('li');

        // Проверка значения поля "Power" и установка классов CSS
        if (power === "ON") {
          button.classList.add('button-on');
          button.addEventListener('click', () => {
            window.location.href = url;
          });
        } else if (power === "OFF") {
          button.classList.add('button-off');
          button.disabled = true;
        }

        li.classList.add('hide');
        li.appendChild(button);
        ul.appendChild(li);
      });

      listWidget.appendChild(ul);

      setTimeout(function() {
        document.getElementById('list-widget').style.display = 'block';

        const listItems = ul.querySelectorAll('li');
        listItems.forEach((item, index) => {
          setTimeout(function() {
            item.classList.add('show');
          }, index * 50);
        });
      }, 100);
    })
    .catch(error => {
      console.error(error);
    });