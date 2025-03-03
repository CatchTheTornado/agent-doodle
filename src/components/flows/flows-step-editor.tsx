// FlowStepEditor.tsx
'use client'
import React from 'react'
import { EditorStep } from '@/flows/models'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { toast } from 'sonner'

interface FlowStepEditorProps {
  step: EditorStep
  onChange: (newStep: EditorStep) => void
  onDelete: () => void
  onNoAgentsError?: () => void
  availableAgentNames: string[]
}

export function FlowStepEditor({
  step,
  onChange,
  onDelete,
  availableAgentNames,
  onNoAgentsError
}: FlowStepEditorProps) {

  const { t } = useTranslation();

  if (!step) {
    return <div className="text-sm text-red-500">{t('No steps to display')}</div>
  }

  switch (step.type) {
    // ----------------------------------
    // STEP
    // ----------------------------------
    case 'step': {
      const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...step, agent: e.target.value })
      }
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...step, input: e.target.value })
      }

      return (
        <Card className="p-2 my-2 border space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-sm">{t('Step')}</div>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Label className="w-20">Agent:</Label>
            <select
              className="border p-1 rounded text-sm"
              value={step.agent ? step.agent : (availableAgentNames.length > 0 ? availableAgentNames[0] : '')}
              onChange={handleAgentChange}
            >
              <option value="">{t('Select agent')}</option>
              {availableAgentNames.map((agentName) => (
                <option key={agentName} value={agentName}>
                  {agentName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="w-20">{t('Input')}</Label>
            <Input
              value={step.input}
              onChange={handleInputChange}
              placeholder="Treść inputu..."
            />
          </div>
        </Card>
      )
    }

    // ----------------------------------
    // SEQUENCE
    // ----------------------------------
    case 'sequence': {
      const { steps } = step

      const addStep = (newSub: EditorStep) => {
        if (availableAgentNames.length === 0) {
            toast.error(t('Please add at least one sub-agent first'))
            if (onNoAgentsError) {
                onNoAgentsError()
            }
            return;
        }
        onChange({ ...step, steps: [...steps, newSub] })
      }

      const handleChangeAt = (index: number, newS: EditorStep) => {
        const newArr = [...steps]
        newArr[index] = newS
        onChange({ ...step, steps: newArr })
      }

      const handleDeleteAt = (index: number) => {
        onChange({ ...step, steps: steps.filter((_, i) => i !== index) })
      }

      return (
        <Card className="p-2 my-2 border space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-m ml-2">{t('Sequence')}</div>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="ml-2">
            {steps.map((child, idx) => (
              <FlowStepEditor
                key={idx}
                step={child}
                onChange={(ns) => handleChangeAt(idx, ns)}
                onDelete={() => handleDeleteAt(idx)}
                availableAgentNames={availableAgentNames}
              />
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                <PlusIcon className="w-4 h-4" />{t('Add step')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => addStep({ type: 'step', agent: '', input: '' })}>
                + step
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addStep({ type: 'sequence', steps: [] })}>
                + sequence
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addStep({ type: 'parallel', steps: [] })}>
                + parallel
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  addStep({
                    type: 'oneOf',
                    branches: [{ when: 'condition', flow: { type: 'step', agent: '', input: '' } }],
                  })
                }
              >
                + oneOf
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  addStep({
                    type: 'forEach',
                    item: 'SomeZodSchemaOrString',
                    inputFlow: { type: 'step', agent: '', input: '' },
                  })
                }
              >
                + forEach
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  addStep({
                    type: 'evaluator',
                    criteria: '',
                    subFlow: { type: 'step', agent: '', input: '' },
                  })
                }
              >
                + evaluator
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  addStep({
                    type: 'bestOfAll',
                    criteria: '',
                    steps: [
                      { type: 'step', agent: '', input: '' },
                      { type: 'step', agent: '', input: '' },
                    ],
                  })
                }
              >
                + bestOfAll
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      )
    }

    // ----------------------------------
    // PARALLEL
    // ----------------------------------
    case 'parallel': {
      const { steps } = step

      const addStep = (newSub: EditorStep) => {
        if (availableAgentNames.length === 0) {
            if (onNoAgentsError) {
                onNoAgentsError()
            }            
            toast.error(t('Please add at least one sub-agent first'))
            return;
        }        
        onChange({ ...step, steps: [...steps, newSub] })
      }

      const handleChangeAt = (index: number, newS: EditorStep) => {
        const newArr = [...steps]
        newArr[index] = newS
        onChange({ ...step, steps: newArr })
      }

      const handleDeleteAt = (index: number) => {
        onChange({ ...step, steps: steps.filter((_, i) => i !== index) })
      }

      return (
        <Card className="my-2 border space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-m ml-2">{t('Parallel')}</div>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="ml-2">
            {steps.map((child, idx) => (
              <FlowStepEditor
                key={idx}
                step={child}
                onChange={(ns) => handleChangeAt(idx, ns)}
                onDelete={() => handleDeleteAt(idx)}
                availableAgentNames={availableAgentNames}
              />
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                Dodaj krok
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => addStep({ type: 'step', agent: '', input: '' })}>
                + step
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addStep({ type: 'sequence', steps: [] })}>
                + sequence
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addStep({ type: 'parallel', steps: [] })}>
                + parallel
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  addStep({
                    type: 'oneOf',
                    branches: [{ when: 'condition', flow: { type: 'step', agent: '', input: '' } }],
                  })
                }
              >
                + oneOf
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  addStep({
                    type: 'forEach',
                    item: 'SomeZodSchemaOrString',
                    inputFlow: { type: 'step', agent: '', input: '' },
                  })
                }
              >
                + forEach
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  addStep({
                    type: 'evaluator',
                    criteria: '',
                    subFlow: { type: 'step', agent: '', input: '' },
                  })
                }
              >
                + evaluator
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  addStep({
                    type: 'bestOfAll',
                    criteria: '',
                    steps: [
                      { type: 'step', agent: '', input: '' },
                      { type: 'step', agent: '', input: '' },
                    ],
                  })
                }
              >
                + bestOfAll
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      )
    }

// ----------------------------------
// ONE-OF
// ----------------------------------
case 'oneOf': {
  const { branches } = step

  // Dodajemy branch, wybierając typ sub-flow z dropdownu
  const addBranch = (flowType: EditorStep['type']) => {
    // W zależności od flowType tworzymy obiekt sub-flow
    let newFlow: EditorStep
    switch (flowType) {
      case 'step':
        newFlow = { type: 'step', agent: '', input: '' }
        break
      case 'sequence':
        newFlow = { type: 'sequence', steps: [] }
        break
      case 'parallel':
        newFlow = { type: 'parallel', steps: [] }
        break
      case 'oneOf':
        newFlow = {
          type: 'oneOf',
          branches: [
            {
              when: 'condition',
              flow: { type: 'step', agent: '', input: '' },
            },
          ],
        }
        break
      case 'forEach':
        newFlow = {
          type: 'forEach',
          item: 'SomeZodSchemaOrString',
          inputFlow: { type: 'step', agent: '', input: '' },
        }
        break
      case 'evaluator':
        newFlow = {
          type: 'evaluator',
          criteria: '',
          subFlow: { type: 'step', agent: '', input: '' },
        }
        break
      case 'bestOfAll':
        newFlow = {
          type: 'bestOfAll',
          criteria: '',
          steps: [
            { type: 'step', agent: '', input: '' },
            { type: 'step', agent: '', input: '' },
          ],
        }
        break
      default:
        // na wszelki wypadek
        newFlow = { type: 'step', agent: '', input: '' }
        break
    }

    const newBranch = {
      when: 'next condition',
      flow: newFlow,
    }
    onChange({
      ...step,
      branches: [...branches, newBranch],
    })
  }

  const handleChangeBranchCondition = (index: number, newCondition: string) => {
    const newArr = [...branches]
    newArr[index] = { ...newArr[index], when: newCondition }
    onChange({ ...step, branches: newArr })
  }

  const handleChangeBranchFlow = (index: number, newFlow: EditorStep) => {
    const newArr = [...branches]
    newArr[index] = { ...newArr[index], flow: newFlow }
    onChange({ ...step, branches: newArr })
  }

  const handleDeleteBranch = (index: number) => {
    onChange({
      ...step,
      branches: branches.filter((_, i) => i !== index),
    })
  }

  return (
    <Card className="p-4 my-2 border space-y-4">
      <div className="flex justify-between items-center">
        <div className="font-semibold text-lg">OneOf</div>
        <Button variant="outline" size="sm" onClick={onDelete}>
              <TrashIcon className="w-4 h-4" />
            </Button>
      </div>

      <div className="ml-2 space-y-2">
        {branches.map((br, idx) => (
          <Card key={idx} className="p-2 border space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">When:</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteBranch(idx)}
              >
                <TrashIcon />
              </Button>
            </div>
            <Input
              value={br.when}
              onChange={(e) => handleChangeBranchCondition(idx, e.target.value)}
            />

            <FlowStepEditor
              step={br.flow}
              onChange={(nf) => handleChangeBranchFlow(idx, nf)}
              onDelete={() =>
                handleChangeBranchFlow(idx, { type: 'step', agent: '', input: '' })
              }
              availableAgentNames={availableAgentNames}
            />
          </Card>
        ))}
      </div>

      {/* Zamiast zwykłego buttona "Dodaj branch" -> dropdown z typami */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm">
            Dodaj branch
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => addBranch('step')}>+ step</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => addBranch('sequence')}>+ sequence</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => addBranch('parallel')}>+ parallel</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => addBranch('oneOf')}>+ oneOf</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => addBranch('forEach')}>+ forEach</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => addBranch('evaluator')}>+ evaluator</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => addBranch('bestOfAll')}>+ bestOfAll</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  )
}


    // ----------------------------------
    // FOR-EACH
    // ----------------------------------
    case 'forEach': {
      const { item, inputFlow } = step

      const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...step, item: e.target.value })
      }

      const handleFlowChange = (newFlow: EditorStep) => {
        onChange({ ...step, inputFlow: newFlow })
      }

      return (
        <Card className="p-2 my-2 border space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-lg ml-2">{t('ForEach')}</div>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Label className="w-20">{t('schema')}</Label>
            <Input value={item} onChange={handleItemChange} />
          </div>

          <div className="ml-2">
            <FlowStepEditor
              step={inputFlow}
              onChange={handleFlowChange}
              onDelete={() =>
                onChange({ ...step, inputFlow: { type: 'step', agent: '', input: '' } })
              }
              availableAgentNames={availableAgentNames}
            />
          </div>
        </Card>
      )
    }

    // ----------------------------------
    // EVALUATOR
    // ----------------------------------
    case 'evaluator': {
      const { criteria, max_iterations, subFlow } = step

      const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...step, criteria: e.target.value })
      }
      const handleMaxIterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10)
        onChange({ ...step, max_iterations: isNaN(val) ? undefined : val })
      }
      const handleSubFlowChange = (ns: EditorStep) => {
        onChange({ ...step, subFlow: ns })
      }

      return (
        <Card className="p-2 my-2 border space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-lg ml-2">{t('Evaluator')}</div>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Label className="w-32">Criteria:</Label>
            <Input value={criteria} onChange={handleCriteriaChange} />
          </div>

          <div className="flex items-center gap-2">
            <Label className="w-32">Max iterations:</Label>
            <Input
              type="number"
              value={max_iterations ?? ''}
              onChange={handleMaxIterChange}
            />
          </div>

          <div className="ml-2">
            <FlowStepEditor
              step={subFlow}
              onChange={handleSubFlowChange}
              onDelete={() =>
                onChange({
                  ...step,
                  subFlow: { type: 'step', agent: '', input: '' },
                })
              }
              availableAgentNames={availableAgentNames}
            />
          </div>
        </Card>
      )
    }

    // ----------------------------------
    // BEST OF ALL
    // ----------------------------------
    case 'bestOfAll': {
      const { criteria, steps } = step

      const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...step, criteria: e.target.value })
      }
      const handleChangeAt = (idx: number, newSub: EditorStep) => {
        const newArr = [...steps]
        newArr[idx] = newSub
        onChange({ ...step, steps: newArr })
      }
      const handleDeleteAt = (idx: number) => {
        onChange({ ...step, steps: steps.filter((_, i) => i !== idx) })
      }
      const addStep = (newSub: EditorStep) => {
        onChange({ ...step, steps: [...steps, newSub] })
      }

      return (
        <Card className="p-4 my-2 border space-y-4">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-lg">BestOfAll</div>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Label className="w-32">Criteria:</Label>
            <Input value={criteria} onChange={handleCriteriaChange} />
          </div>

          <div className="ml-2">
            {steps.map((child, idx) => (
              <FlowStepEditor
                key={idx}
                step={child}
                onChange={(ns) => handleChangeAt(idx, ns)}
                onDelete={() => handleDeleteAt(idx)}
                availableAgentNames={availableAgentNames}
              />
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                Dodaj krok
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => addStep({ type: 'step', agent: '', input: '' })}>
                + step
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addStep({ type: 'sequence', steps: [] })}>
                + sequence
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addStep({ type: 'parallel', steps: [] })}>
                + parallel
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  addStep({
                    type: 'oneOf',
                    branches: [{ when: 'condition', flow: { type: 'step', agent: '', input: '' } }],
                  })
                }
              >
                + oneOf
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  addStep({
                    type: 'forEach',
                    item: 'SomeZodSchemaOrString',
                    inputFlow: { type: 'step', agent: '', input: '' },
                  })
                }
              >
                + forEach
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  addStep({
                    type: 'evaluator',
                    criteria: '',
                    subFlow: { type: 'step', agent: '', input: '' },
                  })
                }
              >
                + evaluator
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  addStep({
                    type: 'bestOfAll',
                    criteria: '',
                    steps: [
                      { type: 'step', agent: '', input: '' },
                      { type: 'step', agent: '', input: '' },
                    ],
                  })
                }
              >
                + bestOfAll
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>        </Card>
      )
    }

    default:
      return <div className="text-red-500">{t('Unknown step')}</div>
  }
}
