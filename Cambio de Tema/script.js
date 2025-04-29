const checkbox = document.getElementById('checkbox');

checkbox.addEventListener('change', () => {
  if (checkbox.checked) {
    document.documentElement.style.setProperty('--bg-color', '#ffffff');
    document.documentElement.style.setProperty('--text-color', '#000000');
  } else {
    document.documentElement.style.setProperty('--bg-color', '#000000');
    document.documentElement.style.setProperty('--text-color', '#ffffff');
  }
});

// Set initial theme based on checkbox default
window.onload = () => {
  if (checkbox.checked) {
    document.documentElement.style.setProperty('--bg-color', '#ffffff');
    document.documentElement.style.setProperty('--text-color', '#000000');
  } else {
    document.documentElement.style.setProperty('--bg-color', '#000000');
    document.documentElement.style.setProperty('--text-color', '#ffffff');
  }
};
