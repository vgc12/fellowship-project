let dropdownToggled = false;
const dropdownContent = document.getElementById('dropdown-content');


document.getElementById('dropdown-button').onclick = () => {
    dropdownToggled = !dropdownToggled
    if(dropdownToggled)
    {
        dropdownContent.classList.replace('none-display','block-display');
    }
    else
    {
        dropdownContent.classList.replace('block-display', 'none-display');
    }

}

