const accordion = document.querySelector('.accordion');
const items = accordion.querySelectorAll('li');

items.forEach((item) => {
  const input = item.querySelector('input[type="radio"]');
  const label = item.querySelector('label');
  const content = item.querySelector('.content');

  input.addEventListener('click', () => {
    items.forEach((otherItem) => {
      if (otherItem!== item) {
        otherItem.querySelector('.content').style.maxHeight = '0';
      }
    });

    if (content.style.maxHeight === '0px') {
      content.style.maxHeight = content.scrollHeight + 'px';
    } else {
      content.style.maxHeight = '0';
    }
  });
});