window.duanduanGameChaoJiYongShi.classes.FormControls = {}





window.duanduanGameChaoJiYongShi.classes.FormControls.mixinCommonFeaturesToSingleFormControl = (function () {
    return function mixinCommonFeaturesToSingleFormControl(formControlInstance) {
        formControlInstance.enable  = enable .bind(formControlInstance)
        formControlInstance.disable = disable.bind(formControlInstance)
        formControlInstance.setDisabledAs = setDisabledAs.bind(formControlInstance)
    }

    function disable() {
        this.el.root.classList.add('is-disabled')
        this.el.input.disabled = true
    }

    function enable() {
        this.el.root.classList.remove('is-disabled')
        this.el.input.disabled = false
    }

    function setDisabledAs(disabled) {
        this.el.root.classList.toggle('is-disabled', !!disabled)
        this.el.input.disabled = !!disabled
    }
})();





window.duanduanGameChaoJiYongShi.classes.FormControls.createFormControlDOMs = function createFormControlDOMs(domCreationConfigurationsArray) {
    const app = window.duanduanGameChaoJiYongShi

    const {
        createDOMWithClassNames
    } = app.utils

    const {
        NumberBox,
        CheckBox,
    } = app.classes.FormControls

    const allControlInstances = []
    const namedControlInstances = {} // 由“uniqueCSSClassName”为索引，凡具备该 CSS 类名的控件实例，即为所谓“named”控件实例。

    const allFormRowsDOM = domCreationConfigurationsArray.map(rowConfig => {
        const rowElement = createDOMWithClassNames('div', [
            'form-controls-row',
        ])

        rowConfig.forEach(formControlConfiguration => {
            let formControlInstance

            const {
                type,
                label,
                options = {},
            } = formControlConfiguration

            const {
                label2,
                uniqueCSSClassName,
            } = options

            switch (type) {
                case 'check-box':
                    formControlInstance = new CheckBox(label, options)
                    break

                case 'number-box':
                    formControlInstance = new NumberBox(label, options)
                    break

                default:
                    throw new RangeError(`表单控件的类型值为“${type}”，这是无效的值。其对应的标签为“${label}${label2 ? ` XXX ${label2}` : ''}”`)
            }

            const formControlRootElement = formControlInstance.el.root
            rowElement.appendChild(formControlRootElement)
            allControlInstances.push(formControlInstance)


            if (uniqueCSSClassName && !namedControlInstances[uniqueCSSClassName]) {
                namedControlInstances[uniqueCSSClassName] = formControlInstance
            }
        })

        return rowElement
    })


    const result = {
        allFormRowsDOM,
        allControlInstances,
        namedControlInstances,
    }

    return result
}





window.duanduanGameChaoJiYongShi.classes.FormControls.createDOMsForSingleFormControl = function createDOMsForSingleFormControl(
    controlInstance, inputType, rootCSSClassName, labelText, options
) {
    const app = window.duanduanGameChaoJiYongShi
    const { createDOMWithClassNames } = app.utils

    const {
        description,
        onChange,
        label2,
        uniqueCSSClassName,
        extraCSSClassNames,
    } = options

    let _extraCSSClassNames = extraCSSClassNames
    if (!Array.isArray(_extraCSSClassNames)) {
        _extraCSSClassNames = [ _extraCSSClassNames ]
    }

    const rootElement = createDOMWithClassNames('div', [
        'form-control',
        rootCSSClassName,
        label2 ? 'has-dual-labels' : '',
        uniqueCSSClassName,
        ..._extraCSSClassNames,
    ])

    const inputId = `input-${rootCSSClassName}-${Math.floor(Math.random() * 100000000)}`
    
    const inputElement = createDOMWithClassNames('input', [
        'the-control',
    ])
    inputElement.type = inputType
    inputElement.id = inputId

    if (typeof onChange === 'function') {
        inputElement.onchange = onChange
    }

    const label1Element = createDOMWithClassNames('label', [
        label2 ? 'label-1' : '',
    ])
    label1Element.innerText = labelText
    label1Element.setAttribute('for', inputId)

    let label2Element

    if (label2) {
        label2Element = createDOMWithClassNames('label', [
            'label-2',
        ])
        label2Element.innerText = label2
        label2Element.setAttribute('for', inputId)
    }
    

    if (label2) {
        rootElement.appendChild(label1Element)
        rootElement.appendChild(inputElement)
        rootElement.appendChild(label2Element)
    } else {
        rootElement.appendChild(inputElement)
        rootElement.appendChild(label1Element)
    }

    if (description) {
        const descriptionElement = createDOMWithClassNames('p', [
            'description',
        ])
        descriptionElement.innerText = description
        rootElement.appendChild(descriptionElement)
    }

    if (!controlInstance.el) {
        controlInstance.el = {}
    }

    const el = controlInstance.el
    el.root  = rootElement
    el.input = inputElement
}
